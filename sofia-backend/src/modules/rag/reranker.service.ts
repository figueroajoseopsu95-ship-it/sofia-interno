import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { ChunkResultDto } from './dtos/search-result.dto';

@Injectable()
export class RerankerService {
    private readonly logger = new Logger(RerankerService.name);
    private anthropic: Anthropic;
    private readonly isEnabled: boolean;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
        this.isEnabled = !!apiKey;

        if (this.isEnabled) {
            this.anthropic = new Anthropic({ apiKey });
        } else {
            this.logger.warn('Anthropic API key missing, reranking will be bypassed.');
        }
    }

    async rerank(query: string, chunks: ChunkResultDto[]): Promise<ChunkResultDto[]> {
        if (!this.isEnabled || chunks.length === 0) {
            return chunks; // Bypass if not configured or empty
        }

        this.logger.debug(`Reranking ${chunks.length} chunks via Claude`);

        // We construct a cross-encoder style prompt for Claude to score each chunk 0-10
        const chunksText = chunks.map((c, i) => `[Chunk ID: ${i}]\nTitle: ${c.documentTitle}\nSection: ${c.sectionTitle || 'N/A'}\nContent:\n${c.content}\n`).join('\n---\n');

        const systemPrompt = `You are a strict relevance evaluator. I will provide you with a user QUERY and multiple CHUNKS of text retrieved from a database. 
    Your job is to assign a score from 0 to 10 for EACH CHUNK, representing how well it answers or relates to the query.
    Return ONLY a JSON array of objects with the following format and nothing else:
    [
      {"chunk_id": <id>, "score": <0-10>}
    ]`;

        const userPrompt = `QUERY: ${query}\n\nCHUNKS:\n${chunksText}`;

        try {
            const response = await this.anthropic.messages.create({
                model: 'claude-3-5-haiku-20241022', // Fast, cheap model perfect for reranking/eval
                max_tokens: 500,
                temperature: 0.1, // Low temp for deterministic scoring
                system: systemPrompt,
                messages: [{ role: 'user', content: userPrompt }]
            });

            // Parse the JSON array
            const textResponse = (response.content[0] as any).text;
            const jsonStart = textResponse.indexOf('[');
            const jsonEnd = textResponse.lastIndexOf(']') + 1;
            const rawJson = textResponse.slice(jsonStart, jsonEnd);

            const scores: Array<{ chunk_id: number, score: number }> = JSON.parse(rawJson);

            // Re-map and sort
            const rerankedChunks = chunks.map((chunk, index) => {
                const foundScore = scores.find(s => s.chunk_id === index);
                // Map 0-10 to 0-1 scale, blend 50/50 with original retrieval score for stability
                const claudeScore = foundScore ? foundScore.score / 10 : chunk.score;
                const hybridScore = (claudeScore * 0.7) + (chunk.score * 0.3);

                return {
                    ...chunk,
                    score: hybridScore
                };
            });

            rerankedChunks.sort((a, b) => b.score - a.score);
            return rerankedChunks;

        } catch (error) {
            this.logger.error(`Reranking failed: ${(error as any).message}. Returning original order.`);
            return chunks; // Fallback gracefully
        }
    }
}

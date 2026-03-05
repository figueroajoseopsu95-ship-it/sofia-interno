import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class EmbeddingService {
    private openai: OpenAI;
    private readonly logger = new Logger(EmbeddingService.name);
    private readonly defaultModel: string;
    private readonly maxRetries = 3;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY') || 'sk-placeholder-configure-in-env';
        this.openai = new OpenAI({ apiKey });
        this.defaultModel = this.configService.get<string>('EMBEDDING_MODEL', 'text-embedding-3-small');
        if (!this.configService.get<string>('OPENAI_API_KEY')) {
            this.logger.warn('OPENAI_API_KEY not set — embedding calls will fail at runtime');
        }
    }

    async generateEmbedding(text: string, model: string = this.defaultModel): Promise<number[]> {
        return this.withRetry(async () => {
            const response = await this.openai.embeddings.create({
                model,
                input: text,
                encoding_format: 'float',
            });
            return response.data[0].embedding;
        });
    }

    async generateBatchEmbeddings(texts: string[], model: string = this.defaultModel): Promise<number[][]> {
        return this.withRetry(async () => {
            const response = await this.openai.embeddings.create({
                model,
                input: texts,
                encoding_format: 'float',
            });
            return response.data.map(d => d.embedding);
        });
    }

    private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
        let lastError: any;

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error: any) {
                lastError = error;

                // Rate limit error specifically
                if (error.status === 429) {
                    const delay = Math.pow(2, attempt) * 1000;
                    this.logger.warn(`Rate limit hit (429). Retrying in ${delay}ms... (Attempt ${attempt}/${this.maxRetries})`);
                    await this.sleep(delay);
                    continue;
                }

                // If it's another type of error, log and break
                this.logger.error(`OpenAI Embedding failed: ${error.message}`);
                throw new InternalServerErrorException('Failed to generate embeddings');
            }
        }

        this.logger.error(`Max retries reached. Last error: ${lastError?.message}`);
        throw new InternalServerErrorException('Failed to generate embeddings after multiple retries due to rate limits');
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

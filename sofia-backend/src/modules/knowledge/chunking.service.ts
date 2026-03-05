import { Injectable } from '@nestjs/common';
import { ChunkOptionsDto } from './dtos/chunk-options.dto';
import { ChunkStrategy } from './dtos/create-collection.dto';

export interface Chunk {
    content: string;
    chunkIndex: number;
    tokenCount: number;
    contentLength: number;
    pageNumbers?: number[];
    sectionTitle?: string;
}

@Injectable()
export class ChunkingService {

    chunkDocument(text: string, options: ChunkOptionsDto): Chunk[] {
        switch (options.strategy) {
            case ChunkStrategy.SEMANTIC:
                return this.semanticChunking(text, options.chunkSize, options.chunkOverlap);
            case ChunkStrategy.RECURSIVE:
                return this.recursiveChunking(text, options.chunkSize, options.chunkOverlap);
            case ChunkStrategy.FIXED_SIZE:
                return this.fixedSizeChunking(text, options.chunkSize, options.chunkOverlap);
            case ChunkStrategy.BY_PAGE:
                return this.byPageChunking(text);
            default:
                return this.semanticChunking(text, options.chunkSize, options.chunkOverlap);
        }
    }

    private fixedSizeChunking(text: string, size: number, overlap: number): Chunk[] {
        const chunks: Chunk[] = [];
        let index = 0;
        let i = 0;

        while (i < text.length) {
            const chunkText = text.slice(i, i + size);
            chunks.push({
                content: chunkText,
                chunkIndex: index++,
                contentLength: chunkText.length,
                tokenCount: this.estimateTokens(chunkText), // Approx calculation
            });

            // Advance by size minus overlap
            i += (size - overlap > 0 ? size - overlap : size);
        }

        return chunks;
    }

    private recursiveChunking(text: string, size: number, overlap: number): Chunk[] {
        // Basic implementation of recursive character splitter (similar to LangChain)
        const separators = ['\n\n', '\n', '. ', ' ', ''];
        const chunks: Chunk[] = [];
        let index = 0;

        const splitText = (textToSplit: string, currentSeparatorIndex: number) => {
            if (textToSplit.length <= size) {
                chunks.push({
                    content: textToSplit.trim(),
                    chunkIndex: index++,
                    contentLength: textToSplit.length,
                    tokenCount: this.estimateTokens(textToSplit),
                });
                return;
            }

            const separator = separators[currentSeparatorIndex];
            // If we ran out of separators, fallback to fixed size
            if (separator === undefined) {
                const fixedChunks = this.fixedSizeChunking(textToSplit, size, overlap);
                fixedChunks.forEach(c => {
                    c.chunkIndex = index++;
                    chunks.push(c);
                });
                return;
            }

            const splits = textToSplit.split(separator).filter(s => s.trim().length > 0);

            let currentChunk = '';

            for (const split of splits) {
                const potentialSize = currentChunk.length + separator.length + split.length;

                if (potentialSize <= size) {
                    currentChunk += (currentChunk ? separator : '') + split;
                } else {
                    if (currentChunk.trim()) {
                        chunks.push({
                            content: currentChunk.trim(),
                            chunkIndex: index++,
                            contentLength: currentChunk.length,
                            tokenCount: this.estimateTokens(currentChunk),
                        });
                    }
                    currentChunk = split; // Start new chunk with current split
                }
            }

            if (currentChunk.trim()) {
                chunks.push({
                    content: currentChunk.trim(),
                    chunkIndex: index++,
                    contentLength: currentChunk.length,
                    tokenCount: this.estimateTokens(currentChunk),
                });
            }
        };

        splitText(text, 0);
        return chunks;
    }

    private semanticChunking(text: string, size: number, overlap: number): Chunk[] {
        // Heuristic: divide by double line breaks first (paragraphs/sections)
        const paragraphs = text.split('\n\n').map(p => p.trim()).filter(Boolean);
        const chunks: Chunk[] = [];
        let currentChunk = '';
        let index = 0;

        // A very basic section title extractor for Markdown-like Headers
        let currentSectionTitle = 'General';

        for (const paragraph of paragraphs) {
            if (paragraph.startsWith('# ')) currentSectionTitle = paragraph.replace(/#/g, '').trim();

            const potentialLength = currentChunk.length + paragraph.length + 2;

            if (potentialLength > size && currentChunk.length > 0) {
                // Save chunk
                chunks.push({
                    content: currentChunk,
                    chunkIndex: index++,
                    contentLength: currentChunk.length,
                    tokenCount: this.estimateTokens(currentChunk),
                    sectionTitle: currentSectionTitle
                });
                // Start next chunk with overlap logic (simplified here to just grab end of last chunk)
                const words = currentChunk.split(' ');
                const overlapWords = words.slice(-Math.floor(overlap / 5)).join(' ');
                currentChunk = overlapWords + '\n\n' + paragraph;
            } else {
                currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
            }
        }

        if (currentChunk) {
            chunks.push({
                content: currentChunk,
                chunkIndex: index++,
                contentLength: currentChunk.length,
                tokenCount: this.estimateTokens(currentChunk),
                sectionTitle: currentSectionTitle
            });
        }

        return chunks;
    }

    private byPageChunking(text: string): Chunk[] {
        // Assuming page markers are inserted by parsing services (e.g. --- PAGE 1 ---)
        const pages = text.split(/--- PAGE \d+ ---/g).map(p => p.trim()).filter(Boolean);

        return pages.map((content, index) => ({
            content,
            chunkIndex: index,
            contentLength: content.length,
            tokenCount: this.estimateTokens(content),
            pageNumbers: [index + 1]
        }));
    }

    // Rough estimation: 1 token ~= 4 chars in spanish/english
    private estimateTokens(text: string): number {
        return Math.ceil(text.length / 4);
    }
}

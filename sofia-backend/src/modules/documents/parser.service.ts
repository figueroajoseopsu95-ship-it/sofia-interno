import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
// @ts-ignore
import * as htmlToText from 'html-to-text';

export interface ParsedDocument {
    text: string;
    pages?: number;
    metadata?: Record<string, any>;
}

@Injectable()
export class ParserService {
    private readonly logger = new Logger(ParserService.name);

    async parseFile(filePath: string, fileType: string): Promise<ParsedDocument> {
        this.logger.log(`Parsing file: ${filePath} (${fileType})`);

        switch (fileType) {
            case 'pdf':
                return this.parsePdf(filePath);
            case 'docx':
                return this.parseDocx(filePath);
            case 'html':
                return this.parseHtml(filePath);
            case 'txt':
                return this.parseText(filePath);
            // fallback for unstructured text
            default:
                return this.parseText(filePath);
        }
    }

    private async parsePdf(filePath: string): Promise<ParsedDocument> {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await (pdfParse as any).default(dataBuffer);

        return {
            text: data.text,
            pages: data.numpages,
            metadata: data.info,
        };
    }

    private async parseDocx(filePath: string): Promise<ParsedDocument> {
        const dataBuffer = fs.readFileSync(filePath);
        const result = await mammoth.extractRawText({ buffer: dataBuffer });

        return {
            text: result.value,
            pages: 1, // Mammoth doesn't track pages naturally
            metadata: {},
        };
    }

    private async parseHtml(filePath: string): Promise<ParsedDocument> {
        const htmlContent = fs.readFileSync(filePath, 'utf-8');
        const text = htmlToText.convert(htmlContent, {
            wordwrap: 130,
        });

        return {
            text,
            pages: 1,
        };
    }

    private async parseText(filePath: string): Promise<ParsedDocument> {
        const text = fs.readFileSync(filePath, 'utf-8');

        return {
            text,
            pages: 1,
        };
    }
}

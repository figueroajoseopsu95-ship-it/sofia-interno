import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { Mistral } from '@mistralai/mistralai';
import * as fs from 'fs';

@Injectable()
export class OcrService {
    private readonly logger = new Logger(OcrService.name);
    private genai: GoogleGenAI;
    private mistral: Mistral;

    constructor(private configService: ConfigService) {
        const geminiKey = this.configService.get<string>('GEMINI_API_KEY') || 'placeholder-configure-in-env';
        const mistralKey = this.configService.get<string>('MISTRAL_API_KEY') || 'placeholder-configure-in-env';
        this.genai = new GoogleGenAI({ apiKey: geminiKey });
        this.mistral = new Mistral({ apiKey: mistralKey });
        if (!this.configService.get<string>('GEMINI_API_KEY')) {
            this.logger.warn('GEMINI_API_KEY not set — OCR via Gemini will fail at runtime');
        }
    }

    async detectOcrNeed(textLength: number, totalPages: number): Promise<boolean> {
        // Si un PDF tiene multiples paginas pero muy pocos caracteres parseados,
        // inferimos que es una imagen/escaneado y necesita OCR
        const charsPerPage = textLength / (totalPages || 1);
        return charsPerPage < 50;
    }

    async processWithGemini(filePath: string, mimeType: string): Promise<string> {
        this.logger.log(`Starting OCR via Gemini for: ${filePath}`);
        try {
            const fileBuffer = fs.readFileSync(filePath);

            // Using the Google GenAI v1 protocol
            const uploadResp = await this.genai.files.upload({
                file: filePath,
                mimeType: mimeType
            } as any);

            const response = await this.genai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                    {
                        role: 'user',
                        parts: [
                            { fileData: { fileUri: uploadResp.uri, mimeType: uploadResp.mimeType } },
                            { text: 'Extract all the text from this document accurately. Preserve structure if possible.' }
                        ]
                    }
                ]
            });

            return response.text || '';
        } catch (error) {
            this.logger.error(`Gemini OCR failed: ${(error as any).message}`);
            throw error;
        }
    }

    async processWithMistral(filePath: string): Promise<string> {
        this.logger.log(`Fallback: Starting OCR via Mistral (Pixtral) for: ${filePath}`);
        try {
            // Mistral Pixtral URL approach (requires base64 or public URLs usually, using base64 for local files)
            const base64Image = fs.readFileSync(filePath, { encoding: 'base64' });
            const mimeType = this.getMimeType(filePath);

            const response = await this.mistral.chat.complete({
                model: 'pixtral-12b-2409',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: 'Extract all the text from this image accurately.' },
                            { type: 'image_url', imageUrl: `data:${mimeType};base64,${base64Image}` }
                        ]
                    }
                ]
            });

            return response.choices[0].message.content as string;
        } catch (error) {
            this.logger.error(`Mistral OCR failed: ${(error as any).message}`);
            throw error;
        }
    }

    private getMimeType(filePath: string): string {
        if (filePath.endsWith('.pdf')) return 'application/pdf';
        if (filePath.endsWith('.png')) return 'image/png';
        if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
        return 'application/octet-stream';
    }
}

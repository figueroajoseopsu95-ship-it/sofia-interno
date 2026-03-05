import { Injectable } from '@nestjs/common';
import { MessageResponseDto } from '../chat/dtos/message-response.dto';
import { GoogleChatResponseDto } from './dtos/google-chat-response.dto';

@Injectable()
export class GoogleChatAdapter {

    // Formats SOFIA's internal response into a rich Google Chat Card
    formatOutgoing(response: MessageResponseDto): GoogleChatResponseDto {
        const cardsV2 = [];

        // Main Answer Card
        const mainWidget = {
            textParagraph: {
                text: response.content
            }
        };

        const widgets = [mainWidget];

        // Append Citations/Sources if they exist
        if (response.sourcesCited && response.sourcesCited.length > 0) {
            let sourcesText = '<b>Fuentes Consultadas:</b><br>';
            response.sourcesCited.forEach((src, idx) => {
                sourcesText += `[${idx + 1}] <i>${src.title}</i> (Confianza alta)<br>`;
            });

            widgets.push({
                textParagraph: {
                    text: sourcesText
                }
            });
        }

        cardsV2.push({
            cardId: `response-${response.id}`,
            card: {
                header: {
                    title: 'SOFIA IA',
                    subtitle: `Agente: ${response.agentName || 'General'}`,
                    imageUrl: 'https://docs.nestjs.com/assets/logo-small.svg', // Replace with internal IA avatar URL
                    imageType: 'CIRCLE'
                },
                sections: [
                    {
                        widgets: widgets
                    }
                ]
            }
        });

        return {
            // The text field is optional if cards are provided, but good for accessibility/notifications
            text: response.content,
            cardsV2
        };
    }
}

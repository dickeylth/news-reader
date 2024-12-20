import type { RequestHandler } from '@builder.io/qwik-city';
import { GeminiService } from '~/utils/ai-summary';

export const onPost: RequestHandler = async (requestEvent) => {
  try {
    const { texts } = await requestEvent.parseBody() as { texts: string[] };
    
    if (!texts || texts.length === 0) {
      requestEvent.send(200, { summary: '' });
      return;
    }

    const geminiService = new GeminiService(requestEvent.env.get('GEMINI_API_KEY'));
    const summary = await geminiService.summarize(texts.join('\n\n'));
    
    requestEvent.send(200, { summary });
  } catch (error) {
    requestEvent.send(500, { error: '生成摘要时出错' });
  }
}; 
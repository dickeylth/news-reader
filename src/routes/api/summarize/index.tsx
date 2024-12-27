import type { RequestHandler } from '@builder.io/qwik-city';
import { GeminiService } from '~/utils/ai-summary';

export const onPost: RequestHandler = async (requestEvent) => {
  try {
    const { texts } = await requestEvent.parseBody() as { texts: string[] };
    
    if (!texts || texts.length === 0) {
      requestEvent.send(200, { summary: '' });
      return;
    }

    const apiKey = requestEvent.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      requestEvent.send(500, 'missing API KEY');
      return;
    }

    const geminiService = new GeminiService(apiKey);
    const summary = await geminiService.summarize(texts.join('\n\n'));
    
    requestEvent.json(200, { summary });
  } catch (error) {
    requestEvent.json(500, { error: '生成摘要时出错' });
  }
}; 
import type { RequestHandler } from '@builder.io/qwik-city';
import type { Comment } from '~/types/hackernews';
import { GeminiService } from '~/utils/ai-summary';
import { RedisCacheService } from '~/utils/redis-cache';

function collectCommentTexts(comment: Comment): string[] {
  const texts: string[] = [];
  if (comment.text) texts.push(comment.text);
  if (comment.replies) {
    comment.replies.forEach(reply => {
      texts.push(...collectCommentTexts(reply));
    });
  }
  return texts;
}

function collectCommentIds(comment: Comment): number[] {
  const ids: number[] = [comment.id];
  if (comment.replies) {
    comment.replies.forEach(reply => {
      ids.push(...collectCommentIds(reply));
    });
  }
  return ids;
}

export const onPost: RequestHandler = async (requestEvent) => {
  try {
    const { comments } = await requestEvent.parseBody() as { comments: Comment[] };
    const commentIds = comments.flatMap(comment => collectCommentIds(comment));
    
    // 初始化缓存服务，传入 requestEvent
    const cacheService = new RedisCacheService(requestEvent);
    
    // 尝试从缓存获取
    const cachedSummary = await cacheService.getSummary(commentIds);
    if (cachedSummary) {
      requestEvent.json(200, { summary: cachedSummary });
      return;
    }
    
    // 如果没有缓存，处理评论文本
    const allCommentTexts = comments.flatMap(comment => collectCommentTexts(comment));
    if (allCommentTexts.length === 0) {
      requestEvent.json(400, { error: '没有可用的评论内容' });
      return;
    }

    const apiKey = requestEvent.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      requestEvent.send(500, 'missing API KEY');
      return;
    }

    const geminiService = new GeminiService(apiKey);
    const summary = await geminiService.summarize(allCommentTexts.join('\n\n'));
    
    // 保存到缓存
    if (summary) {
      await cacheService.setSummary(commentIds, summary);
    }
    
    requestEvent.json(200, { summary });
  } catch (error) {
    requestEvent.json(500, { error: '生成摘要时出错: ' + error });
  }
}; 
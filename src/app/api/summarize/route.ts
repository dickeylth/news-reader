import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { GeminiService } from '@/utils/ai-summary';
import { RedisCacheService } from '@/utils/redis-cache';
import type { Comment } from '@/types/hackernews';
import * as cheerio from 'cheerio';
import axios from 'axios';

export const runtime = 'edge';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('Missing API key')
}
const geminiService = new GeminiService(apiKey);

function collectCommentTexts(comment: Comment, isReply: boolean = false): string[] {
  const texts: string[] = [];
  if (comment.text) {
    texts.push(`${isReply ? '\t' : ''}${comment.by} says: [${comment.text}] at ${comment.time}\n`);
  }
  if (comment.replies) {
    texts.push(`${isReply ? '\t' : ''}${comment.by} has ${comment.replies.length} replies:\n`);
    comment.replies.forEach(reply => {
      texts.push(...collectCommentTexts(reply, true));
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

function extractMainContent(html: string): string {
  const $ = cheerio.load(html);
  $('script, style, nav, header, footer').remove();
  const article = $('article').length ? $('article') : $('body');
  return article.text().trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { comments?: Comment[], url?: string };
    let textToSummarize = '';
    let cacheKey: string[] = [];

    if (body.url) {
      const response = await axios.get(body.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
      });
      const content = extractMainContent(response.data);
      textToSummarize = content;
      cacheKey = [`url:${body.url}`];
    } else if (body.comments) {
      const commentIds = body.comments.flatMap(comment => collectCommentIds(comment));
      const allCommentTexts = body.comments.flatMap(comment => collectCommentTexts(comment));
      textToSummarize = allCommentTexts.join('\n\n');
      cacheKey = commentIds.map(String);
    } else {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const cacheService = new RedisCacheService();
    const cachedSummary = await cacheService.getSummary(cacheKey);
    if (cachedSummary) {
      return NextResponse.json({ summary: cachedSummary });
    }

    const summary = await geminiService.summarize(textToSummarize);
    if (summary) {
      await cacheService.setSummary(cacheKey, summary);
    }

    return NextResponse.json({ summary });
  } catch (error) {
    return NextResponse.json({ error: '生成摘要时出错: ' + error }, { status: 500 });
  }
} 
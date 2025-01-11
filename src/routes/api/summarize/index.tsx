import type { RequestHandler } from '@builder.io/qwik-city';
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';
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

async function extractMainContent(url: string): Promise<string> {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath,
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // 等待页面加载完成
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // 移除不需要的元素
    await page.evaluate(() => {
      ['script', 'style', 'nav', 'header', 'footer'].forEach(tag => {
        document.querySelectorAll(tag).forEach(el => el.remove());
      });
    });
    
    // 获取主要内容
    const content = await page.evaluate(() => {
      const article = document.querySelector('article') || document.body;
      return article.textContent?.trim() || '';
    });

    return content;
  } finally {
    await browser.close();
  }
}

export const onPost: RequestHandler = async (requestEvent) => {
  try {
    const body = await requestEvent.parseBody() as { comments?: Comment[], url?: string };
    let textToSummarize = '';
    let cacheKey: string[] = [];
    
    if (body.url) {
      // 处理 URL 内容
      const content = await extractMainContent(body.url);
      textToSummarize = content;
      cacheKey = [`url:${body.url}`];
    } else if (body.comments) {
      // 处理评论内容
      const commentIds = body.comments.flatMap(comment => collectCommentIds(comment));
      const allCommentTexts = body.comments.flatMap(comment => collectCommentTexts(comment));
      textToSummarize = allCommentTexts.join('\n\n');
      cacheKey = commentIds.map(String);
    } else {
      requestEvent.json(400, { error: '缺少必要参数' });
      return;
    }

    const cacheService = new RedisCacheService(requestEvent);
    const cachedSummary = await cacheService.getSummary(cacheKey);
    if (cachedSummary) {
      requestEvent.json(200, { summary: cachedSummary });
      return;
    }

    const apiKey = requestEvent.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      requestEvent.send(500, 'missing API KEY');
      return;
    }

    const geminiService = new GeminiService(apiKey);
    const summary = await geminiService.summarize(textToSummarize);
    
    if (summary) {
      await cacheService.setSummary(cacheKey, summary);
    }
    
    requestEvent.json(200, { summary });
  } catch (error) {
    requestEvent.json(500, { error: '生成摘要时出错: ' + error });
  }
}; 
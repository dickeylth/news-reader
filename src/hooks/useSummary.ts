import { useState, useEffect, useCallback } from 'react';
import type { Comment as CommentType } from '@/types/hackernews';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true
});

interface UseSummaryOptions {
  type: 'content' | 'comments';
  payload?: string | CommentType[];
  enabled?: boolean;
}

function useSummary({ type, payload, enabled = true }: UseSummaryOptions) {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const reset = useCallback(() => {
    setSummary('');
    setIsLoading(false);
    setError('');
  }, []);

  const fetchSummary = useCallback(async () => {
    if (!payload || !enabled) {
      reset();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        body: JSON.stringify(
          type === 'content' 
            ? { url: payload } 
            : { comments: payload }
        ),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setSummary(md.render(data.summary));
    } catch (error) {
      const message = error instanceof Error ? error.message : `获取${type === 'content' ? '内容' : '评论'}摘要失败`;
      setError(message);
      console.error(`获取${type === 'content' ? '内容' : '评论'}摘要失败:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [type, payload, enabled]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    isLoading,
    error,
    reset,
    retry: fetchSummary
  };
}

export function useContentSummary(url: string | undefined) {
  const {
    summary: contentSummary,
    isLoading: isLoadingContentSummary,
    error: contentError,
    reset: resetContentSummary,
    retry: retryContentSummary
  } = useSummary({
    type: 'content',
    payload: url
  });

  return {
    contentSummary,
    isLoadingContentSummary,
    contentError,
    resetContentSummary,
    retryContentSummary
  };
}

export function useCommentsSummary(comments: CommentType[]) {
  const {
    summary: commentsSummary,
    isLoading: isLoadingCommentsSummary,
    error: commentsError,
    reset: resetCommentsSummary,
    retry: retryCommentsSummary
  } = useSummary({
    type: 'comments',
    payload: comments,
    enabled: comments.length > 0
  });

  return {
    commentsSummary,
    isLoadingCommentsSummary,
    commentsError,
    resetCommentsSummary,
    retryCommentsSummary
  };
} 
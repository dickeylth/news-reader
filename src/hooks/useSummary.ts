import { useState, useEffect, useCallback } from 'react';
import type { Comment as CommentType } from '@/types/hackernews';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true
});

export function useContentSummary(url: string | undefined) {
  const [contentSummary, setContentSummary] = useState<string>('');
  const [isLoadingContentSummary, setIsLoadingContentSummary] = useState(false);
  const [contentError, setContentError] = useState<string>('');

  const resetContentSummary = useCallback(() => {
    setContentSummary('');
    setIsLoadingContentSummary(false);
    setContentError('');
  }, []);

  useEffect(() => {
    if (!url) {
      setContentSummary('');
      setContentError('');
      return;
    }

    const fetchContentSummary = async () => {
      setIsLoadingContentSummary(true);
      setContentError('');
      try {
        const contentResponse = await fetch('/api/summarize', {
          method: 'POST',
          body: JSON.stringify({ url }),
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await contentResponse.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setContentSummary(md.render(data.summary));
      } catch (error) {
        const message = error instanceof Error ? error.message : '获取内容摘要失败';
        setContentError(message);
        console.error('获取内容摘要失败:', error);
      } finally {
        setIsLoadingContentSummary(false);
      }
    };

    fetchContentSummary();
  }, [url]);

  return { contentSummary, isLoadingContentSummary, contentError, resetContentSummary };
}

export function useCommentsSummary(comments: CommentType[]) {
  const [commentsSummary, setCommentsSummary] = useState<string>('');
  const [isLoadingCommentsSummary, setIsLoadingCommentsSummary] = useState(false);
  const [commentsError, setCommentsError] = useState<string>('');

  const resetCommentsSummary = useCallback(() => {
    setCommentsSummary('');
    setIsLoadingCommentsSummary(false);
    setCommentsError('');
  }, []);

  useEffect(() => {
    if (comments.length === 0) {
      setCommentsSummary('');
      setCommentsError('');
      return;
    }

    const fetchCommentsSummary = async () => {
      setIsLoadingCommentsSummary(true);
      setCommentsError('');
      try {
        const summaryResponse = await fetch('/api/summarize', {
          method: 'POST',
          body: JSON.stringify({ comments }),
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await summaryResponse.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setCommentsSummary(md.render(data.summary));
      } catch (error) {
        const message = error instanceof Error ? error.message : '获取评论摘要失败';
        setCommentsError(message);
        console.error('获取评论摘要失败:', error);
      } finally {
        setIsLoadingCommentsSummary(false);
      }
    };

    fetchCommentsSummary();
  }, [comments]);

  return { commentsSummary, isLoadingCommentsSummary, commentsError, resetCommentsSummary };
} 
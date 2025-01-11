import { useState, useEffect } from 'react';
import type { Comment as CommentType } from '@/types/hackernews';

export function useContentSummary(url: string | undefined) {
  const [contentSummary, setContentSummary] = useState('');
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  useEffect(() => {
    if (!url) return;

    const fetchContentSummary = async () => {
      setIsLoadingContent(true);
      try {
        const contentResponse = await fetch('/api/summarize', {
          method: 'POST',
          body: JSON.stringify({ url }),
          headers: { 'Content-Type': 'application/json' },
        });
        const { summary } = await contentResponse.json();
        setContentSummary(summary);
      } catch (error) {
        console.error('获取内容摘要失败:', error);
      } finally {
        setIsLoadingContent(false);
      }
    };

    fetchContentSummary();
  }, [url]);

  return { contentSummary, isLoadingContent };
}

export function useCommentsSummary(comments: CommentType[]) {
  const [commentsSummary, setCommentsSummary] = useState('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  useEffect(() => {
    if (comments.length === 0) return;

    const fetchCommentsSummary = async () => {
      setIsLoadingSummary(true);
      try {
        const summaryResponse = await fetch('/api/summarize', {
          method: 'POST',
          body: JSON.stringify({ comments }),
          headers: { 'Content-Type': 'application/json' },
        });
        const { summary } = await summaryResponse.json();
        setCommentsSummary(summary);
      } catch (error) {
        console.error('获取评论摘要失败:', error);
      } finally {
        setIsLoadingSummary(false);
      }
    };

    fetchCommentsSummary();
  }, [comments]);

  return { commentsSummary, isLoadingSummary };
} 
import { useState, useEffect } from 'react';
import type { Comment as CommentType } from '@/types/hackernews';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true
});

export function useContentSummary(url: string | undefined) {
  const [contentSummary, setContentSummary] = useState('');
  const [isLoadingContentSummary, setIsLoadingContentSummary] = useState(false);

  useEffect(() => {
    if (!url) {
      setContentSummary('');
      return;
    }

    const fetchContentSummary = async () => {
      setIsLoadingContentSummary(true);
      try {
        const contentResponse = await fetch('/api/summarize', {
          method: 'POST',
          body: JSON.stringify({ url }),
          headers: { 'Content-Type': 'application/json' },
        });
        const { summary } = await contentResponse.json();
        setContentSummary(md.render(summary));
      } catch (error) {
        console.error('获取内容摘要失败:', error);
      } finally {
        setIsLoadingContentSummary(false);
      }
    };

    fetchContentSummary();
  }, [url]);

  return { contentSummary, isLoadingContentSummary };
}

export function useCommentsSummary(comments: CommentType[]) {
  const [commentsSummary, setCommentsSummary] = useState('');
  const [isLoadingCommentsSummary, setIsLoadingCommentsSummary] = useState(false);

  useEffect(() => {
    if (comments.length === 0) {
      setCommentsSummary('');
      return;
    }

    const fetchCommentsSummary = async () => {
      setIsLoadingCommentsSummary(true);
      try {
        const summaryResponse = await fetch('/api/summarize', {
          method: 'POST',
          body: JSON.stringify({ comments }),
          headers: { 'Content-Type': 'application/json' },
        });
        const { summary } = await summaryResponse.json();
        setCommentsSummary(md.render(summary));
      } catch (error) {
        console.error('获取评论摘要失败:', error);
      } finally {
        setIsLoadingCommentsSummary(false);
      }
    };

    fetchCommentsSummary();
  }, [comments]);

  return { commentsSummary, isLoadingCommentsSummary };
} 
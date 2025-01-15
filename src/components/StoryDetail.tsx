'use client';

import { useEffect, useState } from 'react';
import { formatTime } from '@/utils/date';
import type { Comment as CommentType, Story } from '@/types/hackernews';
import Comment from './Comment';
import LoadingSpinner from './LoadingSpinner';
import { useContentSummary, useCommentsSummary } from '@/hooks/useSummary';


export default function StoryDetail({ storyId }: { storyId: string }) {
  const [storyData, setStoryData] = useState<{story: Story, comments: CommentType[]} | null>(null);
  const [isLoadingStory, setIsLoadingStory] = useState(false);
  
  const { contentSummary, isLoadingContentSummary, contentError, resetContentSummary } = useContentSummary(storyData?.story.url);
  const { commentsSummary, isLoadingCommentsSummary, commentsError, resetCommentsSummary } = useCommentsSummary(storyData?.comments || []);

  useEffect(() => {
    setStoryData(null);
    resetContentSummary();
    resetCommentsSummary();

    if (!storyId) return;

    const fetchStoryData = async () => {
      setIsLoadingStory(true);
      try {
        const response = await fetch(`/api/story/${storyId}`);
        const data = await response.json();
        setStoryData(data);
      } catch (error) {
        console.error('加载故事失败:', error);
      } finally {
        setIsLoadingStory(false);
      }
    };

    fetchStoryData();
  }, [storyId]);

  return (
    <div className="h-full p-4">
      {isLoadingStory ? (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <LoadingSpinner />
          <p className="text-gray-600">加载故事中...</p>
        </div>
      ) : storyData ? (
        <>
          <h1 className="text-2xl font-bold mb-4">{storyData.story.title}</h1>
          <div className="mb-8">
            <div className="text-sm text-gray-600 flex flex-wrap gap-2">
              <span>{storyData.story.score} points</span>
              <span>•</span>
              <span>by {storyData.story.by}</span>
              <span>•</span>
              <span>{formatTime(storyData.story.time)}</span>
              <span>•</span>
              <span>{storyData.story.descendants} comments</span>
            </div>
            {storyData.story.url && (
              <a href={storyData.story.url} className="text-orange-600 hover:text-orange-700 text-sm mt-2 block" target='_blank' rel='noopener noreferrer'>
                {storyData.story.url}
              </a>
            )}
          </div>

          {isLoadingContentSummary ? (
            <div className="bg-orange-50 rounded-lg p-4 mb-8">
              <div className="flex items-center space-x-3">
                <LoadingSpinner />
                <p className="text-gray-600">正在生成内容摘要...</p>
              </div>
            </div>
          ) : contentError ? (
            <div className="bg-red-50 rounded-lg p-4 mb-8">
              <h2 className="text-lg font-semibold mb-2 text-red-700">内容摘要生成失败</h2>
              <p className="text-red-600">{contentError}</p>
            </div>
          ) : contentSummary && (
            <div className="bg-orange-50 rounded-lg p-4 mb-8">
              <h2 className="text-lg font-semibold mb-2">内容摘要</h2>
              <div className="prose prose-sm markdown-body" dangerouslySetInnerHTML={{ __html: contentSummary }}></div>
            </div>
          )}

          {isLoadingCommentsSummary ? (
            <div className="bg-orange-50 rounded-lg p-4 mb-8">
              <div className="flex items-center space-x-3">
                <LoadingSpinner />
                <p className="text-gray-600">正在生成评论摘要...</p>
              </div>
            </div>
          ) : commentsError ? (
            <div className="bg-red-50 rounded-lg p-4 mb-8">
              <h2 className="text-lg font-semibold mb-2 text-red-700">评论摘要生成失败</h2>
              <p className="text-red-600">{commentsError}</p>
            </div>
          ) : commentsSummary && (
            <div className="bg-orange-50 rounded-lg p-4 mb-8">
              <h2 className="text-lg font-semibold mb-2">评论摘要</h2>
              <div className="prose prose-sm markdown-body" dangerouslySetInnerHTML={{ __html: commentsSummary }}></div>
            </div>
          )}

          <div className="space-y-4">
            {storyData.comments.map((comment) => (
              <Comment key={comment.id} comment={comment} />
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">请选择一个故事查看详情</p>
        </div>
      )}
    </div>
  );
} 
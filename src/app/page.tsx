'use client';

import { useEffect, useState } from 'react';
import type { Story } from '@/types/hackernews';
import StoryItem from '@/components/StoryItem';
import StoryDetail from '@/components/StoryDetail';
import StoryItemSkeleton from '@/components/StoryItemSkeleton';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [isFirstLoading, setIsFirstLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 10;

  const loadMoreStories = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    try {
      const response = await fetch('/api/stories?page=' + page);
      const newStories = await response.json();
      
      if (newStories.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }

      setStories(prev => [...prev, ...newStories]);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setIsLoadingMore(false);
      setIsFirstLoading(false);
    }
  };

  useEffect(() => {
    loadMoreStories();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollHeight - scrollTop - clientHeight < 100) {
        loadMoreStories();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page, isLoadingMore, hasMore]);

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
          <div className="stories-column overflow-y-auto h-screen">
            <div className="px-4 py-8">
              <div className="space-y-4">
                {isFirstLoading ? (
                  Array.from({ length: 10 }).map((_, index) => (
                    <StoryItemSkeleton key={index} />
                  ))
                ) : (
                  stories.map(story => (
                    <StoryItem 
                      key={story.id} 
                      story={story}
                      isSelected={selectedStoryId === story.id}
                      onClick={() => setSelectedStoryId(story.id)}
                    />
                  ))
                )}
              </div>
              
              {!isFirstLoading && isLoadingMore && (
                <div className="text-center py-4">
                  <LoadingSpinner />
                </div>
              )}
              
              {!isFirstLoading && !isLoadingMore && hasMore && (
                <div className="text-center py-4">
                  <button 
                    onClick={loadMoreStories}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    加载更多
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="h-screen overflow-y-auto border-l">
            <StoryDetail storyId={selectedStoryId?.toString() || ''} />
          </div>
        </div>
      </div>
    </main>
  );
} 
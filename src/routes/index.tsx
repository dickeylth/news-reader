import { $, component$, useOnWindow, useSignal, useTask$ } from '@builder.io/qwik';
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from '@builder.io/qwik-city';
import { Header } from '~/components/Header';
import { LoadingSpinner } from '~/components/LoadingSpinner';
import { StoryDetail } from '~/components/StoryDetail';
import { StoryItem } from '~/components/StoryItem';
import type { Story } from '~/types/hackernews';

export const useNewsData = routeLoader$(async () => {
  const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
  const storyIds = await response.json();
  return storyIds;
});

export default component$(() => {
  const storyIds = useNewsData();
  const stories = useSignal<Story[]>([]);
  const page = useSignal(0);
  const loading = useSignal(false);
  const hasMore = useSignal(true);
  const selectedStoryId = useSignal<string>('');
  const ITEMS_PER_PAGE = 10;

  // 加载更多故事的函数
  const loadMoreStories = $(async () => {
    if (loading.value || !hasMore.value) return;

    loading.value = true;
    const start = page.value * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const currentBatch = storyIds.value.slice(start, end);

    if (currentBatch.length === 0) {
      hasMore.value = false;
      loading.value = false;
      return;
    }

    const newStories = await Promise.all(
      currentBatch.map(async (id: number) => {
        const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        const story = await storyResponse.json() as Story;
        
        // 如果有评论，获取最后一条评论的时间
        if (story.kids && story.kids.length > 0) {
          const lastCommentId = story.kids[story.kids.length - 1];
          const commentResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${lastCommentId}.json`);
          const comment = await commentResponse.json();
          story.lastCommentTime = comment.time;
        } else {
          story.lastCommentTime = story.time;
        }
        
        return story;
      })
    );

    stories.value = [...stories.value, ...newStories];
    page.value++;
    loading.value = false;
  });

  // 初始加载
  useTask$(async ({ track }) => {
    track(() => storyIds.value);
    await loadMoreStories();
  });

  // 监听滚动事件
  useOnWindow(
    'scroll',
    $(() => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollHeight - scrollTop - clientHeight < 100) {
        loadMoreStories();
      }
    })
  );

  return (
    <div class="min-h-screen bg-gray-100">
      <Header />
      <main class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
          {/* 左侧故事列表 */}
          <div class="stories-column overflow-y-auto h-screen">
            <div class="px-4 py-8">
              <ul class="space-y-4">
                {stories.value.map((story) => (
                  <li key={story.id} onClick$={() => selectedStoryId.value = story.id.toString()}>
                    <StoryItem 
                      story={story} 
                      isSelected={selectedStoryId.value === story.id.toString()}
                    />
                  </li>
                ))}
              </ul>
              {loading.value && <LoadingSpinner />}
              {!hasMore.value && (
                <div class="text-center py-4 text-gray-600">
                  没有更多故事了
                </div>
              )}
            </div>
          </div>
          
          {/* 右侧详情 */}
          <div class="h-screen overflow-y-auto border-l">
            <StoryDetail storyId={selectedStoryId.value} />
          </div>
        </div>
      </main>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Hacker News Reader",
  meta: [
    {
      name: "description",
      content: "A modern Hacker News reader built with Qwik",
    },
  ],
};

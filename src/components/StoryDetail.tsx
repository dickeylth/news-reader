import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { fetchStory, fetchStoryComments } from '~/utils/hackernews';
import type { Comment, Story } from '~/types/hackernews';
import MarkdownIt from 'markdown-it';
import { formatTime } from '~/utils/date';
import { Comment as CommentComponent } from '~/components/comment/comment';
import { LoadingSpinner } from '~/components/LoadingSpinner';

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true
});

export const StoryDetail = component$<{storyId: string}>(({ storyId }) => {
  const summary = useSignal('');
  const renderedSummary = useSignal('');
  const isLoadingSummary = useSignal(false);
  const isLoadingStory = useSignal(false);
  const storyData = useSignal<{story: Story, comments: Comment[]} | null>(null);

  useVisibleTask$(async ({ track }) => {
    const currentStoryId = track(() => storyId);
    if (!currentStoryId) return;

    isLoadingStory.value = true;
    try {
      const story = await fetchStory(Number(currentStoryId));
      if (!story) return;

      const comments = await fetchStoryComments(currentStoryId);
      storyData.value = { story, comments };

      if (comments.length > 0) {
        isLoadingSummary.value = true;
        try {
          const response = await fetch('/api/summarize', {
            method: 'POST',
            body: JSON.stringify({ comments }),
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const resJSON = await response.json();
          summary.value = resJSON.summary;
          renderedSummary.value = md.render(resJSON.summary);
        } catch (error) {
          console.error('获取摘要失败:', error);
        } finally {
          isLoadingSummary.value = false;
        }
      }
    } catch (error) {
      console.error('加载故事失败:', error);
    } finally {
      isLoadingStory.value = false;
    }
  });

  return (
    <div class="h-full p-4">
      {isLoadingStory.value ? (
        <div class="flex flex-col items-center justify-center h-full space-y-4">
          <LoadingSpinner />
          <p class="text-gray-600">加载故事中...</p>
        </div>
      ) : storyData.value ? (
        <>
          <h1 class="text-2xl font-bold mb-4">{storyData.value.story.title}</h1>
          <div class="mb-8">
            <div class="text-sm text-gray-600 flex flex-wrap gap-2">
              <span>{storyData.value.story.score} points</span>
              <span>•</span>
              <span>by {storyData.value.story.by}</span>
              <span>•</span>
              <span>{formatTime(storyData.value.story.time)}</span>
              <span>•</span>
              <span>{storyData.value.story.descendants} comments</span>
            </div>
            {storyData.value.story.url && (
              <a href={storyData.value.story.url} class="text-orange-600 hover:text-orange-700 text-sm mt-2 block" target='_blank' rel='noopener noreferrer'>
                {storyData.value.story.url}
              </a>
            )}
          </div>

          {isLoadingSummary.value ? (
            <div class="bg-orange-50 rounded-lg p-4 mb-8">
              <div class="flex items-center space-x-3">
                <LoadingSpinner />
                <p class="text-gray-600">正在生成评论摘要...</p>
              </div>
            </div>
          ) : summary.value && (
            <div class="bg-orange-50 rounded-lg p-4 mb-8">
              <h2 class="text-lg font-semibold mb-2">评论摘要</h2>
              <div class="prose prose-sm" dangerouslySetInnerHTML={renderedSummary.value} />
            </div>
          )}

          <div class="space-y-4">
            {storyData.value.comments.map((comment) => (
              <CommentComponent key={comment.id} comment={comment} />
            ))}
          </div>
        </>
      ) : (
        <div class="flex items-center justify-center h-full">
          <p class="text-gray-500">请选择一个故事查看详情</p>
        </div>
      )}
    </div>
  );
}); 
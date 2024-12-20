import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';
import { formatTime } from '~/utils/date';
import type { Comment, Story } from '~/types/hackernews';

// 递归获取评论及其回复
async function fetchCommentThread(commentId: number, depth: number = 0): Promise<Comment | null> {
  if (depth > 3) return null; // 限制递归深度为3层

  const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${commentId}.json`);
  const comment: Comment = await response.json();

  if (comment.dead) return null;

  if (comment.kids && comment.kids.length > 0) {
    const replies = await Promise.all(
      comment.kids.map(kidId => fetchCommentThread(kidId, depth + 1))
    );
    comment.replies = replies.filter((reply): reply is Comment => reply !== null);
  }

  return comment;
}

export const useStoryData = routeLoader$(async (requestEvent) => {
  const storyId = requestEvent.params.id;
  const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
  const story: Story = await storyResponse.json();

  const comments = await Promise.all(
    (story.kids || []).slice(0, 10).map((commentId: number) => fetchCommentThread(commentId))
  );

  const validComments = comments.filter((comment): comment is Comment => comment !== null);

  return { 
    story,
    comments: validComments
  };
});

// 评论组件
const Comment = component$<{ comment: Comment; depth?: number }>(({ comment, depth = 0 }) => {
  const maxDepth = 3; // 最大显示深度
  const isMaxDepth = depth >= maxDepth;

  if (comment.deleted) {
    return (
      <div class="text-gray-500 italic ml-[--indent]" style={{ '--indent': `${depth * 24}px` }}>
        [comment deleted]
      </div>
    );
  }

  return (
    <div class="comment" style={{ '--indent': `${depth * 24}px` }}>
      <div class={`bg-white rounded-lg shadow p-4 ml-[--indent] ${depth > 0 ? 'border-l-2 border-orange-200' : ''}`}>
        <div class="text-sm text-gray-600 mb-2 flex flex-wrap gap-2">
          <span>by {comment.by}</span>
          <span>•</span>
          <span>{formatTime(comment.time)}</span>
        </div>
        {comment.text && (
          <div class="prose prose-sm max-w-none mb-4" dangerouslySetInnerHTML={comment.text} />
        )}
        {!isMaxDepth && comment.replies && comment.replies.length > 0 && (
          <div class="mt-4">
            {comment.replies.map((reply) => (
              <Comment key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default component$(() => {
  const data = useStoryData();
  const summary = useSignal('');
  const isLoadingSummary = useSignal(false);

  // 使用 useVisibleTask$ 替换 useTask$
  useVisibleTask$(async ({ track }) => {
    const storyData = track(() => data.value);
    
    if (!storyData.comments || storyData.comments.length === 0) {
      return;
    }
    
    isLoadingSummary.value = true;
    try {
      const allCommentTexts = storyData.comments.flatMap(comment => {
        function collectCommentTexts(c: Comment): string[] {
          const texts: string[] = [];
          if (c.text) texts.push(c.text);
          if (c.replies) {
            c.replies.forEach(reply => {
              texts.push(...collectCommentTexts(reply));
            });
          }
          return texts;
        }
        return collectCommentTexts(comment);
      });

      if (allCommentTexts.length === 0) {
        return;
      }

      const response = await fetch('/api/summarize', {
        method: 'POST',
        body: JSON.stringify({ texts: allCommentTexts }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const { summary: newSummary } = await response.json();
      summary.value = newSummary;
    } catch (error) {
      console.error('获取摘要失败:', error);
    } finally {
      isLoadingSummary.value = false;
    }
  });

  return (
    <div class="max-w-4xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-4">{data.value.story.title}</h1>
      <div class="mb-8">
        <div class="text-sm text-gray-600 flex flex-wrap gap-2">
          <span>{data.value.story.score} points</span>
          <span>•</span>
          <span>by {data.value.story.by}</span>
          <span>•</span>
          <span>{formatTime(data.value.story.time)}</span>
          <span>•</span>
          <span>{data.value.story.descendants} comments</span>
        </div>
        {data.value.story.url && (
          <a href={data.value.story.url} class="text-orange-600 hover:text-orange-700 text-sm mt-2 block">
            {data.value.story.url}
          </a>
        )}
      </div>

      {isLoadingSummary.value ? (
        <div class="bg-orange-50 rounded-lg p-4 mb-8">
          <p class="text-gray-600">正在生成评论摘要...</p>
        </div>
      ) : summary.value && (
        <div class="bg-orange-50 rounded-lg p-4 mb-8">
          <h2 class="text-lg font-semibold mb-2">评论摘要</h2>
          <div class="prose prose-sm">{summary.value}</div>
        </div>
      )}

      <div class="space-y-4">
        {data.value.comments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const { story } = resolveValue(useStoryData);
  return {
    title: `${story.title} | Hacker News Reader`,
    meta: [
      {
        name: "description",
        content: `${story.title} - Posted by ${story.by} with ${story.descendants} comments`,
      },
    ],
  };
};

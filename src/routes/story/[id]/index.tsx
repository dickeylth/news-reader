import { component$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';
import { formatTime } from '~/utils/date';

interface Comment {
  id: number;
  by: string;
  text: string;
  time: number;
  kids?: number[];
  replies?: Comment[];
  deleted?: boolean;
  dead?: boolean;
}

interface Story {
  id: number;
  title: string;
  by: string;
  time: number;
  text?: string;
  url?: string;
  score: number;
  descendants: number;
  kids?: number[];
}

// 递归获取评论及其回复
async function fetchCommentThread(commentId: number, depth: number = 0): Promise<Comment | null> {
  if (depth > 3) return null; // 限制递归深度为3层

  const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${commentId}.json`);
  const comment: Comment = await response.json();

  if (!comment || comment.dead) return null;

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

  // 获取顶层评论及其回复
  const comments = await Promise.all(
    (story.kids || []).slice(0, 10).map((commentId: number) => fetchCommentThread(commentId))
  );

  return { 
    story, 
    comments: comments.filter((comment): comment is Comment => comment !== null)
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
          <div 
            class="prose prose-orange max-w-none" 
            dangerouslySetInnerHTML={`<div>${comment.text}</div>`}
          />
        )}
      </div>
      {!isMaxDepth && comment.replies && comment.replies.length > 0 && (
        <div class="mt-2 space-y-2">
          {comment.replies.map(reply => (
            <Comment key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
      {isMaxDepth && comment.replies && comment.replies.length > 0 && (
        <div class="mt-2 ml-[--indent] pl-6">
          <a 
            href={`#${comment.id}`} 
            class="text-orange-500 hover:text-orange-600 text-sm"
          >
            {comment.replies.length} more replies...
          </a>
        </div>
      )}
    </div>
  );
});

export default component$(() => {
  const data = useStoryData();
  const { story, comments } = data.value;

  return (
    <div class="min-h-screen bg-gray-100">
      <header class="bg-orange-500 p-4">
        <div class="container mx-auto">
          <a href="/" class="text-white hover:text-gray-200">← Back to Home</a>
        </div>
      </header>
      
      <main class="container mx-auto px-4 py-8">
        <article class="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">{story.title}</h1>
          <div class="text-gray-600 mb-4 flex flex-wrap gap-2">
            <span>{story.score} points</span>
            <span>•</span>
            <span>by {story.by}</span>
            <span>•</span>
            <span>posted {formatTime(story.time)}</span>
            <span>•</span>
            <span>{story.descendants || 0} comments</span>
          </div>
          {story.url && (
            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              class="text-orange-500 hover:text-orange-600 break-all"
            >
              {story.url}
            </a>
          )}
          {story.text && (
            <div 
              class="mt-4 prose prose-orange max-w-none" 
              dangerouslySetInnerHTML={`<div>${story.text}</div>`}
            />
          )}
        </article>

        <section class="mt-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Comments</h2>
          <div class="space-y-6">
            {comments.map(comment => (
              <Comment key={comment.id} comment={comment} />
            ))}
          </div>
        </section>
      </main>
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
        content: `${story.title} - Posted by ${story.by} with ${story.descendants || 0} comments`,
      },
    ],
  };
};

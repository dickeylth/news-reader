import { component$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';
import { formatTime } from '~/utils/date';
import { GeminiService } from '~/utils/ai-summary';

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

  // 获取所有评论及其回复
  const comments = await Promise.all(
    (story.kids || []).slice(0, 10).map((commentId: number) => fetchCommentThread(commentId))
  );

  const validComments = comments.filter((comment): comment is Comment => comment !== null);

  // 收集所有评论文本，包括回复
  function collectCommentTexts(comment: Comment): string[] {
    const texts: string[] = [];
    if (comment.text) {
      texts.push(comment.text);
    }
    if (comment.replies) {
      comment.replies.forEach(reply => {
        texts.push(...collectCommentTexts(reply));
      });
    }
    return texts;
  }

  // 收集所有评论文本
  const allCommentTexts = validComments.flatMap(collectCommentTexts);
  
  // 生成总结
  // 初始化 Gemini 服务
  const geminiService = new GeminiService(process.env.GEMINI_API_KEY);
  const summary = allCommentTexts.length > 0 
    ? await geminiService.summarize(allCommentTexts.join('\n\n'))
    : '';

  return { 
    story,
    comments: validComments,
    summary
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
  const { story, comments, summary } = data.value;

  return (
    <div class="max-w-4xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-4">{story.title}</h1>
      <div class="mb-8">
        <div class="text-sm text-gray-600 flex flex-wrap gap-2">
          <span>{story.score} points</span>
          <span>•</span>
          <span>by {story.by}</span>
          <span>•</span>
          <span>{formatTime(story.time)}</span>
          <span>•</span>
          <span>{story.descendants} comments</span>
        </div>
        {story.url && (
          <a href={story.url} class="text-orange-600 hover:text-orange-700 text-sm mt-2 block">
            {story.url}
          </a>
        )}
      </div>

      {summary && (
        <div class="bg-orange-50 rounded-lg p-4 mb-8">
          <h2 class="text-lg font-semibold mb-2">评论摘要</h2>
          <div class="prose prose-sm">{summary}</div>
        </div>
      )}

      <div class="space-y-4">
        {comments.map((comment) => (
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

import { component$ } from '@builder.io/qwik';
import { formatTime } from '~/utils/date';
import type { Comment as CommentType } from '~/types/hackernews';

export const Comment = component$<{ comment: CommentType; depth?: number }>(({ comment, depth = 0 }) => {
  const maxDepth = 3;
  const isMaxDepth = depth >= maxDepth;

  if (comment.deleted) {
    return (
      <div class="text-gray-500 italic ml-[--indent]" style={{ '--indent': `${depth * 24}px` }}>
        [comment deleted]
      </div>
    );
  }

  return (
    <div class="comment" style={{ '--indent': `${depth * 16}px` }}>
      <div class={`bg-white rounded-lg shadow-sm p-2.5 ml-[--indent] ${depth > 0 ? 'border-l border-orange-200' : ''}`}>
        <div class="text-xs text-gray-500 mb-1.5 flex flex-wrap gap-1.5">
          <span>by {comment.by}</span>
          <span>•</span>
          <span>{formatTime(comment.time)}</span>
        </div>
        {comment.text && (
          <div 
            class="prose prose-sm max-w-none text-sm [&>p]:!my-1.5 [&>ul]:!my-1.5 [&>ol]:!my-1.5 [&>pre]:!my-2" 
            dangerouslySetInnerHTML={comment.text}
          />
        )}
        {!isMaxDepth && comment.replies && comment.replies.length > 0 && (
          <div class="mt-2">
            {comment.replies.map((reply) => (
              <Comment key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}); 
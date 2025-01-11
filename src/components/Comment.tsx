import { formatTime } from '@/utils/date';
import type { Comment as CommentType } from '@/types/hackernews';

export default function Comment({ comment, depth = 0 }: { comment: CommentType; depth?: number }) {
  const maxDepth = 3;
  const isMaxDepth = depth >= maxDepth;

  if (comment.deleted) {
    return (
      <div className="text-gray-500 italic ml-[--indent]" style={{ '--indent': `${depth * 24}px` } as any}>
        [comment deleted]
      </div>
    );
  }

  return (
    <div className="comment" style={{ '--indent': `${depth * 16}px` } as any}>
      <div className={`bg-white rounded-lg shadow-sm p-2.5 ml-[--indent] ${depth > 0 ? 'border-l border-orange-200' : ''}`}>
        <div className="text-xs text-gray-500 mb-1.5 flex flex-wrap gap-1.5">
          <span>by {comment.by}</span>
          <span>•</span>
          <span>{formatTime(comment.time)}</span>
        </div>
        {comment.text && (
          <div 
            className="prose prose-sm max-w-none text-sm [&>p]:!my-1.5 [&>ul]:!my-1.5 [&>ol]:!my-1.5 [&>pre]:!my-2" 
            dangerouslySetInnerHTML={{ __html: comment.text }}
          />
        )}
        {!isMaxDepth && comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => (
              <Comment key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
import StoryItem from './StoryItem';
import type { Story } from '@/types/hackernews';

const SKELETON_STORY: Story = {
  id: 0,
  title: '\u00A0'.repeat(60), // 使用 non-breaking space 占位
  by: '\u00A0'.repeat(12),
  time: Date.now() / 1000,
  score: 0,
  descendants: 0,
  lastCommentTime: Date.now() / 1000
};

export default function StoryItemSkeleton() {
  return (
    <div className="animate-pulse">
      <StoryItem 
        story={SKELETON_STORY}
        isSelected={false}
        onClick={() => {}}
        isSkeleton={true}
      />
    </div>
  );
} 
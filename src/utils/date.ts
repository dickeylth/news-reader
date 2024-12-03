import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// 扩展 dayjs 以支持相对时间
dayjs.extend(relativeTime);

export function formatTime(timestamp: number): string {
  return dayjs.unix(timestamp).fromNow();
}

import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function formatTime(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp * 1000), {
    addSuffix: true,
    locale: zhCN
  });
}

export function formatTime(date: Date | undefined): string {
  const diff = Date.now() - (date?.getTime() || 0);

  const minutes = Math.floor(diff / 60000);

  if (minutes < 60) {
    return `${minutes} minutes ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hours ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days} days ago`;
}
export function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const differenceInMinutes = Math.max(
    0,
    Math.floor((now.getTime() - date.getTime()) / 60000),
  );

  if (differenceInMinutes < 60) {
    return `${differenceInMinutes} minutes ago`;
  }

  const differenceInHours = Math.floor(differenceInMinutes / 60);

  if (differenceInHours < 24) {
    return `${differenceInHours} hours ago`;
  }

  const differenceInDays = Math.floor(differenceInHours / 24);

  if (differenceInDays < 7) {
    return `${differenceInDays} days ago`;
  }

  const differenceInWeeks = Math.floor(differenceInDays / 7);

  if (differenceInWeeks < 5) {
    return `${differenceInWeeks} weeks ago`;
  }

  const differenceInMonths = Math.floor(differenceInDays / 30);

  return `${differenceInMonths} months ago`;
}

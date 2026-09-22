export function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString();
}

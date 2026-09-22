export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString();
}

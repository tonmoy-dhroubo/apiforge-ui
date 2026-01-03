export function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function humanFileSize(size?: number | null) {
  if (!size && size !== 0) return "-";
  if (size < 1024) return `${size.toFixed(1)} KB`;
  const mb = size / 1024;
  return `${mb.toFixed(2)} MB`;
}

export function truncateMiddle(value: string, limit = 32) {
  if (value.length <= limit) return value;
  const half = Math.floor((limit - 3) / 2);
  return `${value.slice(0, half)}...${value.slice(-half)}`;
}

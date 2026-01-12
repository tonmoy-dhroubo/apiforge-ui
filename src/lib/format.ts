export function formatDate(value?: string) {
	if (!value) return "-";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleString();
}

export function humanFileSize(size?: number | string | null) {
	if (size === null || size === undefined || size === "") return "-";
	const parsed = typeof size === "number" ? size : Number(size);
	if (Number.isNaN(parsed)) return "-";
	if (parsed < 1024) return `${parsed.toFixed(1)} KB`;
	const mb = parsed / 1024;
	return `${mb.toFixed(2)} MB`;
}

export function truncateMiddle(value: string, limit = 32) {
	if (value.length <= limit) return value;
	const half = Math.floor((limit - 3) / 2);
	return `${value.slice(0, half)}...${value.slice(-half)}`;
}

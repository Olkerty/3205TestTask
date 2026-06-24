import type { UrlResult } from '../api/types';

const statusColors: Record<string, string> = {
	pending: '#9ca3af',
	in_progress: '#3b82f6',
	success: '#10b981',
	error: '#ef4444',
	cancelled: '#6b7280',
};

/** Строка результата одного URL */
export function UrlResultItem({ item }: { item: UrlResult }) {
	return (
		<div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0', borderBottom: '1px solid #f3f4f6', fontSize: 14 }}>
			<span
				style={{
					width: 10,
					height: 10,
					borderRadius: '50%',
					background: statusColors[item.status] || '#9ca3af',
					flexShrink: 0,
				}}
			/>
			<span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
				{item.url}
			</span>
			<span style={{ fontWeight: 600, minWidth: 60, textAlign: 'right' }}>
				{item.status}
			</span>
			{item.httpStatus && (
				<span style={{ minWidth: 36, textAlign: 'right', color: item.httpStatus >= 400 ? '#ef4444' : '#10b981' }}>
					{item.httpStatus}
				</span>
			)}
			{item.error && (
				<span style={{ minWidth: 150, fontSize: 12, color: '#ef4444', textAlign: 'right' }}>
					{item.error}
				</span>
			)}
			{item.duration !== undefined && (
				<span style={{ minWidth: 60, fontSize: 12, color: '#6b7280', textAlign: 'right' }}>
					{(item.duration / 1000).toFixed(1)}s
				</span>
			)}
		</div>
	);
}

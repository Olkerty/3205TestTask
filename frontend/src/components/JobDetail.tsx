import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchJobDetail, cancelJob, setActiveJob, fetchJobs } from '../store/jobsSlice';
import { UrlResultItem } from './UrlResultItem';

const terminalStatuses = new Set(['completed', 'cancelled', 'failed']);

/** Панель деталей выбранной задачи. Опрошивает каждые 2 с, останавливается при терминальном статусе. */
export function JobDetail() {
	const dispatch = useAppDispatch();
	const { activeJobId, activeJob, detailLoading } = useAppSelector((s) => s.jobs);
	const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

	/** Запустить опрос деталей задачи при выборе задачи. Очистка при размонтировании или смене ID. */
	useEffect(() => {
		if (!activeJobId) return;

		const poll = () => {
			dispatch(fetchJobDetail(activeJobId));
		};

		poll();
		pollingRef.current = setInterval(poll, 2000);

		return () => {
			if (pollingRef.current) {
				clearInterval(pollingRef.current);
				pollingRef.current = null;
			}
		};
	}, [activeJobId, dispatch]);

	/** Остановить опрос, когда задача достигает терминального статуса. */
	useEffect(() => {
		if (activeJob && terminalStatuses.has(activeJob.status)) {
			if (pollingRef.current) {
				clearInterval(pollingRef.current);
				pollingRef.current = null;
			}
		}
	}, [activeJob]);

	if (!activeJobId) {
		return (
			<div style={{ color: '#9ca3af', padding: 40, textAlign: 'center' }}>
				Select a job to view details
			</div>
		);
	}

	if (detailLoading && !activeJob) {
		return <div style={{ padding: 20 }}>Loading job details...</div>;
	}

	if (!activeJob) {
		return <div style={{ padding: 20 }}>Job not found</div>;
	}

	const processed = activeJob.urls.filter((u) => u.status === 'success' || u.status === 'error' || u.status === 'cancelled').length;
	const isTerminal = terminalStatuses.has(activeJob.status);

	return (
		<div>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
				<div>
					<h2 style={{ margin: 0 }}>Job Details</h2>
					<div style={{ fontSize: 12, color: '#6b7280' }}>{activeJob.id}</div>
				</div>
				<div style={{ display: 'flex', gap: 8 }}>
					<span style={{ fontWeight: 600 }}>Status: {activeJob.status}</span>
					{!isTerminal && (
						<button
							onClick={async () => {
								await dispatch(cancelJob(activeJob.id));
								dispatch(fetchJobs());
							}}
							style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}
						>
							Cancel
						</button>
					)}
				</div>
			</div>

			<div style={{ marginBottom: 12, fontSize: 14 }}>
				Progress: {processed} / {activeJob.urls.length} processed
			</div>

			{detailLoading && <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Updating...</div>}

			<div style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 12px', maxHeight: 400, overflow: 'auto' }}>
				{activeJob.urls.map((item, i) => (
					<UrlResultItem key={i} item={item} />
				))}
			</div>
		</div>
	);
}

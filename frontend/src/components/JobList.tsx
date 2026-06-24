import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchJobs, setActiveJob } from '../store/jobsSlice';

const statusColors: Record<string, string> = {
	pending: '#f59e0b',
	in_progress: '#3b82f6',
	completed: '#10b981',
	cancelled: '#6b7280',
	failed: '#ef4444',
};

/** Список всех задач */
export function JobList() {
	const dispatch = useAppDispatch();
	const { jobs, listLoading, activeJobId } = useAppSelector((s) => s.jobs);

	useEffect(() => {
		dispatch(fetchJobs());
	}, [dispatch]);

	return (
		<div>
			<h2>Jobs</h2>
			{listLoading && jobs.length === 0 && <p>Loading...</p>}
			{jobs.map((job) => (
				<div
					key={job.id}
					onClick={() => dispatch(setActiveJob(job.id))}
					style={{
						border: activeJobId === job.id ? '2px solid #3b82f6' : '1px solid #d1d5db',
						borderRadius: 6,
						padding: '8px 12px',
						marginBottom: 8,
						cursor: 'pointer',
						background: activeJobId === job.id ? '#eff6ff' : '#fff',
					}}
				>
					<div style={{ fontSize: 12, color: '#6b7280' }}>{job.id.slice(0, 8)}...</div>
					<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
						<span style={{ color: statusColors[job.status] || '#000', fontWeight: 600 }}>
							{job.status}
						</span>
						<span style={{ fontSize: 13 }}>
							{new Date(job.createdAt).toLocaleString()}
						</span>
					</div>
					<div style={{ fontSize: 13, marginTop: 4 }}>
						{job.successCount}/{job.totalCount} ok, {job.errorCount} errors
					</div>
				</div>
			))}
		</div>
	);
}

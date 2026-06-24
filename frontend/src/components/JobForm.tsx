import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createJob, fetchJobs } from '../store/jobsSlice';

/** Форма создания задачи проверки URL. Пользователь вводит по одному URL на строку. */
export function JobForm() {
	const dispatch = useAppDispatch();
	const { createLoading } = useAppSelector((s) => s.jobs);
	const [text, setText] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const urls = text
			.split('\n')
			.map((s) => s.trim())
			.filter((s) => s.length > 0);
		if (urls.length === 0) return;

		await dispatch(createJob(urls));
		setText('');
		dispatch(fetchJobs());
	};

	return (
		<form
			onSubmit={handleSubmit}
			style={{
				display: 'flex',
				flexDirection: 'column'
			}}
		>
			<h2>New Job</h2>
			<textarea
				value={text}
				onChange={(e) => setText(e.target.value)}
				rows={6}
				placeholder="Enter URLs, one per line"
				disabled={createLoading}
			/>
			<button type="submit" disabled={createLoading || text.trim().length === 0}>
				{createLoading ? 'Creating...' : 'Run Check'}
			</button>
		</form>
	);
}

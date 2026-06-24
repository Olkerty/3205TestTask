/** Корневой компонент приложения. Двухколоночный макет: форма + список задач слева, панель деталей справа. */
import { JobForm } from './components/JobForm';
import { JobList } from './components/JobList';
import { JobDetail } from './components/JobDetail';
import { useAppSelector } from './store/hooks';

export default function App() {
	const { error } = useAppSelector((s) => s.jobs);

	return (
		<div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
			<h1>URL Checker</h1>
			{error && (
				<div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '8px 12px', marginBottom: 16, color: '#dc2626', fontSize: 14 }}>
					{error}
				</div>
			)}
			<div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>
				<div>
					<JobForm />
					<div style={{ marginTop: 24 }}>
						<JobList />
					</div>
				</div>
				<div>
					<JobDetail />
				</div>
			</div>
		</div>
	);
}

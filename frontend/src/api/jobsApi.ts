/** API-клиент для эндпоинтов /api/jobs. Использует axios с общим base URL. */
import axios from 'axios';
import type { JobSummary, JobDetail } from './types';

const http = axios.create({ baseURL: '/api' });

/** Создать новую задачу и вернуть её ID. */
export async function createJob(urls: string[]): Promise<{ jobId: string }> {
	const { data } = await http.post('/jobs', { urls });
	return data;
}

/** Получить краткий список всех задач. */
export async function fetchJobs(): Promise<JobSummary[]> {
	const { data } = await http.get('/jobs');
	return data;
}

/** Получить полную информацию о задаче, включая результаты по каждому URL. */
export async function fetchJobDetail(id: string): Promise<JobDetail> {
	const { data } = await http.get(`/jobs/${id}`);
	return data;
}

/** Отменить задачу по её ID. */
export async function cancelJob(id: string): Promise<void> {
	await http.delete(`/jobs/${id}`);
}

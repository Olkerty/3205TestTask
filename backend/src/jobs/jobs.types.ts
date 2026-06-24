/** Возможные состояния задачи на верхнем уровне. */
export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'failed';
/** Возможные состояния отдельного URL внутри задачи. */
export type UrlStatus = 'pending' | 'in_progress' | 'success' | 'error' | 'cancelled';

/** Результат проверки одного URL внутри задачи. */
export type UrlResult = {
	url: string;
	status: UrlStatus;
	httpStatus?: number;
	error?: string;
	startedAt?: string;
	finishedAt?: string;
	duration?: number;
}

/** Полная модель задачи, включая AbortController для отмены. */
export type Job = {
	id: string;
	createdAt: string;
	status: JobStatus;
	urls: UrlResult[];
	totalCount: number;
	successCount: number;
	errorCount: number;
	abortController: AbortController;
}

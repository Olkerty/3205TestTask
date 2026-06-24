/** Краткое представление задачи (без данных по URL), используется в списке сбоку. */
export type JobSummary = {
	id: string;
	createdAt: string;
	status: string;
	totalCount: number;
	successCount: number;
	errorCount: number;
};

/** Результат проверки одного URL внутри задачи. Соответствует backend-типу UrlResult. */
export type UrlResult = {
	url: string;
	status: string;
	httpStatus?: number;
	error?: string;
	startedAt?: string;
	finishedAt?: string;
	duration?: number;
};

/** Полная информация о задаче, возвращаемая из GET /api/jobs/:id, включая результаты по URL. */
export type JobDetail = {
	id: string;
	createdAt: string;
	status: string;
	urls: UrlResult[];
};

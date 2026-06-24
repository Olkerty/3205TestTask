/** Бизнес-логика задач проверки URL: CRUD, отмена и передача в UrlCheckerService. */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { JobsStore } from './jobs.store';
import { UrlCheckerService } from './url-checker.service';
import { Job, JobStatus } from './jobs.types';

@Injectable()
export class JobsService {
	constructor(
		private readonly store: JobsStore,
		private readonly urlChecker: UrlCheckerService,
	) {}

	/** Создать новую задачу: валидировать URL, сохранить и запустить обработку в фоне. */
	create(urls: string[]): { jobId: string } {
		if (!Array.isArray(urls) || urls.length === 0) {
			throw new BadRequestException('urls must be a non-empty array');
		}
		for (const url of urls) {
			if (typeof url !== 'string') {
				throw new BadRequestException('Each URL must be a string');
			}
		}

		const jobId = uuidv4();
		const abortController = new AbortController();

		const job: Job = {
			id: jobId,
			createdAt: new Date().toISOString(),
			status: 'pending',
			urls: urls.map(url => ({ url, status: 'pending' })),
			totalCount: urls.length,
			successCount: 0,
			errorCount: 0,
			abortController,
		};

		this.store.set(jobId, job);

		this.urlChecker.processJob(jobId).catch(() => {
			const job = this.store.get(jobId);
			if (job && job.status === 'in_progress') {
				this.store.updateStatus(jobId, 'failed');
			}
		});

		return { jobId };
	}

	/** Вернуть краткий список всех задач (без данных по URL). */
	findAll(): { id: string; createdAt: string; status: JobStatus; totalCount: number; successCount: number; errorCount: number }[] {
		return this.store.getAll().map(j => ({
			id: j.id,
			createdAt: j.createdAt,
			status: j.status,
			totalCount: j.totalCount,
			successCount: j.successCount,
			errorCount: j.errorCount,
		}));
	}

	/** Вернуть полную информацию о задаче, включая результаты по каждому URL. */
	findOne(id: string) {
		const job = this.store.get(id);
		if (!job) {
			throw new NotFoundException('Job not found');
		}

		return {
			id: job.id,
			createdAt: job.createdAt,
			status: job.status,
			totalCount: job.totalCount,
			successCount: job.successCount,
			errorCount: job.errorCount,
			urls: job.urls
		};
	}

	/** Отменить задачу, прервав выполняющиеся HTTP-запросы. */
	cancel(id: string): { message: string } {
		const job = this.store.get(id);
		if (!job) {
			throw new NotFoundException('Job not found');
		}

		if (job.status === 'completed' || job.status === 'cancelled' || job.status === 'failed') {
			throw new BadRequestException(`Job is already ${job.status}`);
		}

		job.abortController.abort();
		return { message: 'Job cancelled' };
	}
}

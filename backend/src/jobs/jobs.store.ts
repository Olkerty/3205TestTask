/** In-memory хранилище задач. Всё состояние хранится здесь; без базы данных и персистентности. */
import { Injectable } from '@nestjs/common';
import { Job, JobStatus } from './jobs.types';

@Injectable()
export class JobsStore {
	private readonly jobs = new Map<string, Job>();

	/** Сохранить новую задачу в хранилище. */
	set(id: string, job: Job): void {
		this.jobs.set(id, job);
	}

	/** Получить задачу по ID, или undefined, если не найдена. */
	get(id: string): Job | undefined {
		return this.jobs.get(id);
	}

	/** Вернуть все задачи из хранилища. */
	getAll(): Job[] {
		return Array.from(this.jobs.values());
	}

	/** Обновить верхнеуровневый статус задачи (напр. pending → in_progress). */
	updateStatus(id: string, status: JobStatus): void {
		const job = this.jobs.get(id);
		if (job) job.status = status;
	}

	/** Обновить поля отдельного URL-результата (статус, HTTP-код, тайминги, ошибка). */
	updateUrl(id: string, index: number, updates: Partial<{
		status: string;
		httpStatus?: number;
		error?: string;
		startedAt?: string;
		finishedAt?: string;
		duration?: number;
	}>): void {
		const job = this.jobs.get(id);
		if (job && job.urls[index]) {
			Object.assign(job.urls[index], updates);
		}
	}

	/** Увеличить счётчик успешных URL задачи. */
	incrementSuccess(id: string): void {
		const job = this.jobs.get(id);
		if (job) job.successCount++;
	}

	/** Увеличить счётчик ошибок задачи. */
	incrementError(id: string): void {
		const job = this.jobs.get(id);
		if (job) job.errorCount++;
	}
}

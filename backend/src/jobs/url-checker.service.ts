/** Проверяет доступность URL через HEAD-запросы с контролем конкурентности и поддержкой отмены. */
import { Injectable } from '@nestjs/common';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';
import { JobsStore } from './jobs.store';

@Injectable()
export class UrlCheckerService {
	constructor(private readonly store: JobsStore) {}

	/** Обработать все URL задачи с лимитом конкурентности 5.
	 *  Каждый URL получает искусственную задержку 0–10 с для симуляции реального разброса.
	 *  Поддерживает отмену через AbortController — ожидающие URL помечаются как cancelled. */
	async processJob(jobId: string): Promise<void> {
		const job = this.store.get(jobId);
		if (!job) return;

		this.store.updateStatus(jobId, 'in_progress');

		const urls = job.urls;
		const abortSignal = job.abortController.signal;
		const semaphore = 5;
		const queue = [...urls.entries()];
		let running = 0;
		let idx = 0;

		return new Promise<void>((resolve) => {
			const next = () => {
				if (abortSignal.aborted) {
					for (const [i, urlResult] of urls.entries()) {
						if (urlResult.status === 'pending') {
							this.store.updateUrl(jobId, i, { status: 'cancelled' });
						}
					}
					this.store.updateStatus(jobId, 'cancelled');
					resolve();
					return;
				}

				while (running < semaphore && idx < queue.length) {
					const [i, urlResult] = queue[idx++];
					running++;
					this.store.updateUrl(jobId, i, { status: 'in_progress', startedAt: new Date().toISOString() });

					(async () => {
						try {
							const artificialDelay = Math.floor(Math.random() * 10000);
							await this.delay(artificialDelay);

							if (abortSignal.aborted) {
								this.store.updateUrl(jobId, i, { status: 'cancelled' });
								running--;
								next();
								return;
							}

							const httpStatus = await this.headRequest(urlResult.url, abortSignal);
							const finishedAt = new Date().toISOString();
							const startedAt = urls[i].startedAt!;
							const duration = new Date(finishedAt).getTime() - new Date(startedAt).getTime();

							this.store.updateUrl(jobId, i, { status: 'success', httpStatus, finishedAt, duration });
							this.store.incrementSuccess(jobId);
						} catch (err: unknown) {
							const finishedAt = new Date().toISOString();
							const startedAt = urls[i].startedAt!;
							const duration = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
							const errObj = err as { name?: string; code?: string; message?: string };

							if (errObj.name === 'AbortError' || errObj.code === 'ABORT_ERR') {
								this.store.updateUrl(jobId, i, { status: 'cancelled' });
							} else {
								this.store.updateUrl(jobId, i, { status: 'error', error: errObj.message || 'Unknown error', finishedAt, duration });
								this.store.incrementError(jobId);
							}
						} finally {
							running--;
							next();
						}
					})();
				}

				if (running === 0 && idx >= queue.length) {
					const updatedJob = this.store.get(jobId);
					if (updatedJob && updatedJob.status !== 'cancelled') {
						this.store.updateStatus(jobId, 'completed');
					}
					resolve();
				}
			};

			next();
		});
	}

	/** Подождать указанное количество миллисекунд. */
	private delay(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	/** Выполнить HTTP HEAD-запрос к URL и вернуть код статуса.
	 *  Выбрасывает ошибку при сетевой ошибке, таймауте (10 с) или сигнале отмены. */
	private headRequest(urlStr: string, signal: AbortSignal): Promise<number> {
		return new Promise((resolve, reject) => {
			const parsed = new URL(urlStr);
			const mod = parsed.protocol === 'https:' ? https : http;
			const req = mod.request(urlStr, {
				method: 'HEAD',
				signal,
				timeout: 10000,
			}, (res) => {
				resolve(res.statusCode ?? 0);
			});
			req.on('error', (err) => reject(err));
			req.on('timeout', () => {
				req.destroy();
				reject(new Error('Request timeout'));
			});
			req.end();
		});
	}
}

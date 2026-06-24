/** REST-контроллер для управления задачами проверки URL. */
import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { JobsService } from './jobs.service';

@Controller('api/jobs')
export class JobsController {
	constructor(private readonly jobsService: JobsService) {}

	/** Создать новую задачу для проверки указанных URL. */
	@Post()
	create(@Body('urls') urls: string[]) {
		return this.jobsService.create(urls);
	}

	/** Получить список всех задач (краткий вид, без деталей по URL). */
	@Get()
	findAll() {
		return this.jobsService.findAll();
	}

	/** Получить полную информацию о задаче, включая результаты по каждому URL. */
	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.jobsService.findOne(id);
	}

	/** Отменить выполняющуюся или ожидающую задачу по ID. */
	@Delete(':id')
	cancel(@Param('id') id: string) {
		return this.jobsService.cancel(id);
	}
}

/** Redux slice для задач — управляет списком, деталями, созданием и отменой. */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { createJob as apiCreateJob, fetchJobs as apiFetchJobs, fetchJobDetail as apiFetchJobDetail, cancelJob as apiCancelJob } from '../api/jobsApi';
import type { JobSummary, JobDetail } from '../api/types';

type JobsState = {
	jobs: JobSummary[];
	activeJobId: string | null;
	activeJob: JobDetail | null;
	listLoading: boolean;
	detailLoading: boolean;
	createLoading: boolean;
	error: string | null;
}

const initialState: JobsState = {
	jobs: [],
	activeJobId: null,
	activeJob: null,
	listLoading: false,
	detailLoading: false,
	createLoading: false,
	error: null,
};

/** Запросить все задачи (краткий список). */
export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async () => {
	return apiFetchJobs();
});

/** Создать новую задачу из массива URL и вернуть ID созданной задачи. */
export const createJob = createAsyncThunk(
	'jobs/createJob',
	async (urls: string[]) => {
		const result = await apiCreateJob(urls);
		return result.jobId;
	},
);

/** Запросить полную информацию о задаче (используется для polling). */
export const fetchJobDetail = createAsyncThunk(
	'jobs/fetchJobDetail',
	async (id: string) => {
		return apiFetchJobDetail(id);
	},
);

/** Отменить задачу по её ID. */
export const cancelJob = createAsyncThunk(
	'jobs/cancelJob',
	async (id: string) => {
		await apiCancelJob(id);
		return id;
	},
);

const jobsSlice = createSlice({
	name: 'jobs',
	initialState,
	reducers: {
		/** Установить ID выбранной задачи и очистить кеш её деталей. */
		setActiveJob(state, action: PayloadAction<string | null>) {
			state.activeJobId = action.payload;
			if (action.payload === null) {
				state.activeJob = null;
			}
		},
		/** Сбросить сообщение об ошибке. */
		clearError(state) {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchJobs.pending, (state) => {
				state.listLoading = true;
				state.error = null;
			})
			.addCase(fetchJobs.fulfilled, (state, action) => {
				state.listLoading = false;
				state.jobs = action.payload;
			})
			.addCase(fetchJobs.rejected, (state, action) => {
				state.listLoading = false;
				state.error = action.error.message || 'Failed to fetch jobs';
			})
			.addCase(createJob.pending, (state) => {
				state.createLoading = true;
				state.error = null;
			})
			.addCase(createJob.fulfilled, (state, action) => {
				state.createLoading = false;
				state.activeJobId = action.payload;
				state.activeJob = null;
			})
			.addCase(createJob.rejected, (state, action) => {
				state.createLoading = false;
				state.error = action.error.message || 'Failed to create job';
			})
			.addCase(fetchJobDetail.pending, (state) => {
				state.detailLoading = true;
				state.error = null;
			})
			.addCase(fetchJobDetail.fulfilled, (state, action) => {
				state.detailLoading = false;
				if (state.activeJobId === action.payload.id) {
					state.activeJob = action.payload;
				}
			})
			.addCase(fetchJobDetail.rejected, (state, action) => {
				state.detailLoading = false;
				state.error = action.error.message || 'Failed to fetch job detail';
			})
			.addCase(cancelJob.fulfilled, (state, action) => {
				const id = action.payload;
				if (state.activeJobId === id && state.activeJob) {
					state.activeJob.status = 'cancelled';
				}
			})
			.addCase(cancelJob.rejected, (state, action) => {
				state.error = action.error.message || 'Failed to cancel job';
			});
	},
});

export const { setActiveJob, clearError } = jobsSlice.actions;
export default jobsSlice.reducer;

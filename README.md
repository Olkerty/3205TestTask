# URL Checker

REST API для асинхронной проверки списка URL + фронтенд-приложение для работы с API.

## Стек

- **Backend**: NestJS + TypeScript
- **Frontend**: React + Redux Toolkit + TypeScript + Vite
- **Монорепозиторий**: npm workspaces

## Быстрый старт

```bash
# установить зависимости (через npm@10 для стабильности)
npm run clean-install

# запустить backend (3001) и frontend (5173) одновременно
npm start
```

Открыть http://localhost:5173 в браузере.

## Структура проекта

```
.
├── backend/               # NestJS API
│   └── src/jobs/          # модуль jobs (Controller, Service, Store, UrlChecker)
├── frontend/              # React + Vite
│   └── src/
│       ├── api/           # axios-клиент и типы
│       ├── store/         # Redux Toolkit (store, slice, hooks)
│       └── components/    # JobForm, JobList, JobDetail, UrlResultItem
├── package.json           # корневой манифест (workspaces)
└── package-lock.json      # единый lockfile
```

## API Endpoints

| Метод | Путь | Описание |
|---|---|---|
| POST | /api/jobs | Создать задание |
| GET | /api/jobs | Список заданий |
| GET | /api/jobs/:id | Детали задания |
| DELETE | /api/jobs/:id | Отменить задание |

## Если пакеты сломались

```bash
npm run clean-install   # переустановит всё
```

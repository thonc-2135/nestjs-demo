# NestJS Demo — RealWorld (Medium clone) Backend API

Backend API cho bài tập lớn NestJS, clone theo spec [RealWorld](https://realworld-docs.netlify.app/implementation-creation/features/):

- Authenticate users via JWT (login/signup)
- CRU- Users (sign up & settings, không xóa)
- CRUD Articles
- CR-D Comments (không update)
- GET danh sách Articles có pagination
- Favorite Articles
- Follow Users

API tuân theo spec: https://realworld-docs.netlify.app/specifications/backend/endpoints/

## Stack

- [NestJS](https://nestjs.com) 12
- TypeORM + PostgreSQL (migration viết tay, không synchronize)
- JWT (`@nestjs/jwt`, `passport-jwt`) + Redis (blacklist token khi logout)
- class-validator / class-transformer
- nestjs-i18n (en/vi)
- @nestjs/swagger (`/api/docs`)

## Yêu cầu môi trường

- Node.js >= 24
- pnpm >= 11
- PostgreSQL 16
- Redis

## Cài đặt

```bash
pnpm install
cp .env.example .env
```

### Database (PostgreSQL)

```bash
brew install postgresql@16
brew services start postgresql@16

export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
psql postgres -c "CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'postgres';"
createdb -O postgres nestjs_demo
```

Hoặc `docker compose up -d` (`docker-compose.yml`) nếu máy dùng Docker/Colima.

### Redis

```bash
brew install redis
brew services start redis
```

### Migration

```bash
pnpm migration:add src/database/migrations/<TenMigration>  # tạo file rỗng, tự viết SQL
pnpm migration:apply                                        # chạy migration chưa apply
pnpm migration:revert                                       # revert migration gần nhất
pnpm migration:reset                                         # drop toàn bộ schema + apply lại từ đầu
```

## Chạy dự án

```bash
pnpm start:dev
```

API sẽ chạy tại `http://localhost:3000/api`, Swagger UI tại `http://localhost:3000/api/docs`.

## Test

```bash
pnpm test
pnpm test:e2e
```

## Lint

```bash
pnpm lint
```

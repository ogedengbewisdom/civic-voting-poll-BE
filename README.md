# CivicPoll — Backend API

A RESTful API for the CivicPoll civic engagement platform. Built with NestJS, PostgreSQL, and TypeORM.

---

## Tech Stack

| Technology           | Purpose           |
| -------------------- | ----------------- |
| NestJS               | Backend framework |
| PostgreSQL           | Database          |
| TypeORM              | ORM + Migrations  |
| JWT                  | Authentication    |
| Bcrypt               | Password hashing  |
| Nodemailer + Mailgun | Email delivery    |
| Swagger              | API documentation |
| winston              | logger            |

---

## Project Structure

```
src/
├── common/
│   ├── decorators/        # @Roles, @Public decorators
│   ├── filter/            # http error filter
│   ├── guard/             # AuthGuard, RoleGuard
│   ├── interceptors/      # Response interceptor
│   ├── interface/         # interface
│   ├── logger/            # winston config logger
│   ├── middleware/        # Request logger
│   └── pipe/              # ParamsPipe
│
├── modules/
│   ├── authentication/    # Login, register, forgot/reset password
│   ├── mail/              # Mailgun email service
│   ├── poll/              # Poll CRUD + activate/close
│   ├── poll-options/      # PollOption entity
│   ├── state/             # Nigerian states
│   ├── users/             # User profile + management
│   └── votes/             # Cast vote + results
│
├── migrations/            # TypeORM migration files
├── types/                 # Global type declarations
├── app.module.ts
├── app.controller.ts
├── app.service.ts
├── data-source.ts         # TypeORM DataSource config
└── main.ts
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL database
- Mailgun account (for email)

### Installation

```bash
# clone the repo
git clone https://github.com/ogedengbewisdom/civic-voting-poll-BE.git
cd civic-voting-poll-BE

# install dependencies
npm install

# create environment file
cp .env.sample .env
```

### Environment Variables

Fill in your `.env` file:

```env
# App
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=civic_poll_db

# Production only
DATABASE_URL=postgresql://user:password@host/dbname

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION_TIME=1h
JWT_RESET_PASSWORD_SECRET=your_reset_secret
JWT_RESET_PASSWORD_EXPIRATION_TIME=5m

# Mailgun
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_sandbox_domain

# Frontend
FE_BASE_URL=http://localhost:4200
```

### Database Setup

```bash
# run migrations
npm run migration:run
```

### Running the App

```bash
# development
npm run start:dev

# production
npm run build
npm run start:prod
```

Server runs on `http://localhost:3000`

API docs available at `http://localhost:3000/api/docs`

---

## API Endpoints

### Authentication (Public)

| Method | Endpoint                             | Description               |
| ------ | ------------------------------------ | ------------------------- |
| POST   | `/api/v1              `              | Check app health status   |
| POST   | `/api/v1/auth/register`              | Register new user         |
| POST   | `/api/v1/auth/login`                 | Login                     |
| POST   | `/api/v1/auth/forgot-password`       | Send password reset email |
| POST   | `/api/v1/auth/reset-password/:token` | Reset password            |

### Users (Protected)

| Method | Endpoint                | Description        | Role  |
| ------ | ----------------------- | ------------------ | ----- |
| GET    | `/api/v1/users`         | Get all users      | Admin |
| GET    | `/api/v1/users/profile` | Get own profile    | User  |
| PUT    | `/api/v1/users/profile` | Update own profile | User  |

### State

| Method | Endpoint        | Description               |
| ------ | --------------- | ------------------------- |
| GET    | `/api/v1/state` | Get all states in Nigeria |

### Polls (Admin only)

| Method | Endpoint                    | Description                          |
| ------ | --------------------------- | ------------------------------------ |
| GET    | `/api/v1/poll`              | Get all polls with pagination        |
| GET    | `/api/v1/poll/active`       | Get all active polls with pagination |
| POST   | `/api/v1/poll`              | Create new poll with options         |
| GET    | `/api/v1/poll/:id`          | Get poll by ID                       |
| GET    | `/api/v1/poll/:id/active`   | Get active poll by ID                |
| PATCH  | `/api/v1/poll/:id`          | Update poll and options              |
| DELETE | `/api/v1/poll/:id`          | Soft delete poll                     |
| PATCH  | `/api/v1/poll/:id/activate` | Activate poll                        |
| PATCH  | `/api/v1/poll/:id/close`    | Close poll                           |

### Votes (Protected)

| Method | Endpoint                                        | Description        |
| ------ | ----------------------------------------------- | ------------------ |
| POST   | `/api/v1/votes/poll/:poll_id/option/:option_id` | Cast a vote        |
| GET    | `/api/v1/votes/poll/:poll_id/check`             | check vote         |
| GET    | `/api/v1/votes/:poll_id/results`                | Get poll results   |
| GET    | `/api/v1/votes/dashboard`                       | Get vote dashboard |

---

## Database Schema

```
states       — id, name
             — one state → many users
             — one state → many votes

users        — id, first_name, last_name, email, password, role, state_id (FK → states)
             — one user → many votes
             — one user → many polls (created)

poll         — id, title, description, status (draft|active|closed), created_by (FK → users)
             — one poll → many poll_options
             — one poll → many votes

poll_options — id, poll_id (FK → poll), option_text
             — one option → many votes

votes        — id, user_id (FK → users), poll_id (FK → poll), option_id (FK → poll_options), state_id (FK → states)
             — unique: user_id + poll_id (one vote per user per poll)
```

---

## Migrations

```bash
# generate new migration after entity changes
npm run migration:generate --src/migrations/migrationName

# run all pending migrations
npm run migration:run

# revert last migration
npm run migration:revert
```

---

## Business Rules

- Users can only vote **once per poll** — enforced at application and database level
- Only **admin** users can create, edit, activate, close, or delete polls
- Newly created polls have draft default status, admin can activate so it can be available in active polls
- Votes record the user's **state at time of voting** for regional analytics so updating state after voting does not affect the vote state aggregation
- Passwords are hashed with **bcrypt** before storage
- Password reset tokens expire in **5 minutes**
- Access tokens expire in **1 hour**

---

## User Roles

| Role    | Description                                                  |
| ------- | ------------------------------------------------------------ |
| `user`  | Register, login, view active polls, cast votes, view results |
| `admin` | All user permissions + full poll management |

---

## Author

Built by **Wisdom Ogedengbe** as a capstone project for the Seamfix Developer Program.

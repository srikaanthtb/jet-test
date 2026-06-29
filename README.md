# JET Fullstack Test

A fullstack sample application using Node.js and Express for the backend, and React for the frontend.

## Features

- Express backend with REST endpoints
- React frontend served from the `client/` app
- Docker Compose configuration for local development
- Automated tests using Jest and Supertest
- exposes /couriers to list all couriers
- exposes /couriers/:ID to list details on a single courier by using either the Global Employee ID or the Courier ID.

## Prerequisites

- Node.js 18+ and npm
- Docker Engine
- Docker Compose

## Getting Started

### Clone the repository

```bash
git clone https://github.com/srikaanthtb/jet-test.git
cd jet-test
```

### Run with Docker Compose

```bash
docker compose up --build
```

Open your browser at:

```bash
http://localhost:3000/
```

## Testing

```bash
npm test
```

## Project Structure

- `app.js` — Express application setup
- `bin/www` — server entry point
- `client/` — React frontend application
- `routes/` — Express route handlers
- `lib/` — shared backend utilities
- `tests/` — automated test cases

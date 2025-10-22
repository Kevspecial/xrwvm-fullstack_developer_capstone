# Car Dealership Reviews – Full‑Stack Capstone

Looking for project details? See the comprehensive documentation:

- documentation.md

## Quick start

High‑level steps (details in documentation.md):
- Start the Node + Mongo data service in `server/database` (build the `nodeapp` image, then `docker compose up -d`).
- Start the Flask sentiment microservice in `server/djangoapp/microservices` (Docker or local Python).
- Install Python deps in `server/` and run Django: `python manage.py runserver 0.0.0.0:8000`.
- Build the React app in `server/frontend`: `npm ci && npm run build`, then open http://localhost:8000.
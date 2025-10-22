# Car Dealership Reviews – Full‑Stack Capstone

## Overview
This project is a full‑stack web application for browsing car dealerships, viewing dealer details and customer reviews, and posting new reviews after authentication. It demonstrates a microservices‑style architecture with:
- Django (Python) as the web backend and API gateway
- A Node.js + MongoDB data service for dealerships and reviews
- A Flask sentiment analysis microservice using NLTK VADER
- A React single‑page application (SPA) frontend

The Django app orchestrates data from the Node service and augments review lists with sentiment labels from the Flask service. The React SPA provides the UI for login/registration, dealer browsing, dealer detail pages, and posting reviews.


## Key features
- User registration and login
- Browse all dealers and filter by state
- View dealer details with customer reviews
- Sentiment tagging on reviews (positive/neutral/negative)
- Authenticated users can post reviews (car make/model/year, purchase date)


## High‑level architecture
Data flow for a typical page (Dealer Details):
1. React requests dealer details and reviews from Django endpoints under `/djangoapp/...`.
2. Django fetches the raw data from the Node.js service (configured via `backend_url`).
3. For each review, Django calls the Flask sentiment microservice (configured via `sentiment_analyzer_url`).
4. Django returns enriched JSON to the React client.

Services and ports (defaults):
- React dev server: http://localhost:3000 (optional during development)
- Django app: http://localhost:8000
- Node + Mongo data service: http://localhost:3030 (Mongo on 27017)
- Flask sentiment service: http://localhost:5050


## Repository layout (selected)
- `server/`
  - `manage.py` – Django entrypoint
  - `requirements.txt` – Python backend deps
  - `djangoproj/` – Django project (settings, URLs)
  - `djangoapp/` – Django app (views, models, REST bridging, microservice)
    - `models.py` – `CarMake`, `CarModel`
    - `views.py` – auth, dealers, dealer details, reviews, add review
    - `restapis.py` – calls to Node service and sentiment microservice
    - `populate.py` – seeds `CarMake`/`CarModel`
    - `microservices/` – Flask app for sentiment analysis
  - `database/` – Node.js + MongoDB service and seed data
    - `app.js` – Express API + Mongoose models, loads JSON and exposes endpoints
    - `Dockerfile`, `docker-compose.yml` – containerization and Mongo orchestration
    - `data/` – `dealerships.json`, `reviews.json`
  - `frontend/` – React SPA (Create React App)
    - `src/App.js` – routes: `/login`, `/register`, `/dealers`, `/dealer/:id`, `/postreview/:id`


## Django endpoints (SPA/API)
Base path: `/djangoapp/`
- `POST /login` – authenticate user
- `POST /registration` – register new user
- `GET /logout` – log out user
- `GET /get_cars` – list available car make/model pairs
- `GET /get_dealers` – list all dealers
- `GET /get_dealers/<state>` – list dealers for state
- `GET /dealer/<id>` – get single dealer details
- `GET /reviews/dealer/<id>` – get reviews for a dealer (enriched with sentiment)
- `POST /add_review` – add a review (requires authenticated session)

Notes:
- The root SPA routes (`/`, `/dealers`, `/dealer/:id`, etc.) are served by Django templates pointing to the built React app (`frontend/build`).


## Node data service endpoints
Base URL: `http://localhost:3030`
- `GET /fetchDealers` – all dealerships
- `GET /fetchDealers/:state` – dealerships filtered by state
- `GET /fetchDealer/:id` – a dealership by id
- `GET /fetchReviews` – all reviews
- `GET /fetchReviews/dealer/:id` – reviews for a dealership
- `POST /insert_review` – create a new review

The service connects to MongoDB (default connection string in code: `mongodb://mongo_db:27017/`, DB name `dealershipsDB`). On start it clears and seeds collections from local JSON files.


## Sentiment microservice
- Flask app using `nltk.sentiment.SentimentIntensityAnalyzer`
- Endpoint: `GET /analyze/<text>` → `{ "sentiment": "positive|neutral|negative" }`
- Default base URL used by Django: `http://localhost:5050`


## Environment configuration
Django reads service locations from environment variables (via `python-dotenv`). Create a `.env` file in the `server/` folder or export vars in your shell:
- `backend_url` – Node data service base URL (default `http://localhost:3030`)
- `sentiment_analyzer_url` – Flask microservice base URL (default `http://localhost:5050/`)

Example `.env` (place next to `server/manage.py`):
```
backend_url=http://localhost:3030
sentiment_analyzer_url=http://localhost:5050/
```


## Local development and running
Prerequisites:
- Python 3.9+
- Node.js 18+
- Docker and Docker Compose (for Mongo + Node service)

1) Start Node + Mongo data service (server/database)
- Build the Node API image and start services:
  - `docker build -t nodeapp .`
  - `docker compose up -d`
- This starts MongoDB (27017) and the API (3030) and seeds data from JSON.

2) Start the sentiment microservice (server/djangoapp/microservices)
- Option A: Docker
  - `docker build -t sentiment .`
  - `docker run --rm -p 5050:5000 sentiment`
- Option B: Local Python
  - `pip install -r requirements.txt`
  - `python -m flask run -p 5050`

3) Install and start Django (server)
- Create and activate a virtual env (optional) and install deps:
  - `pip install -r requirements.txt`
- Apply migrations and run:
  - `python manage.py migrate`
  - `python manage.py runserver 0.0.0.0:8000`

4) Build the React app (server/frontend)
- For Django to serve the SPA, build the frontend:
  - `npm ci`
  - `npm run build`
- Then visit http://localhost:8000

Development tip:
- The React app uses relative API paths like `/djangoapp/...`. In dev (CRA at :3000), configure a proxy in `frontend/package.json` or use the Django‑served build as described above to avoid CORS/proxy issues.


## Data models
Django models (server/djangoapp/models.py):
- `CarMake(name, description)`
- `CarModel(car_make → CarMake, name, type, year)`
  - Validation: year is 2015–2023 (adjust as needed)
- `populate.initiate()` seeds a set of makes/models on first access to `/djangoapp/get_cars`.

MongoDB collections (via Mongoose in the Node service):
- `dealerships` – id, name, address, city, state, zip
- `reviews` – id, name, dealership, review, purchase, purchase_date, car_make, car_model, car_year


## Known caveats and notes
- `DEBUG` is set to `False` in Django settings; set `DEBUG=True` for local development if needed and adjust `ALLOWED_HOSTS` accordingly.
- Frontend dev server does not have a proxy configured; prefer building the SPA or add a `proxy` entry in `frontend/package.json`.
- Car year validator in Django caps at 2023; update validators for newer model years.
- The Node `docker-compose.yml` expects an image named `nodeapp`; ensure you build it before `docker compose up`.


## License
This project is licensed under the Apache License, Version 2.0. See the `LICENSE` file for details.

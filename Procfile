web: sh -c "npm --prefix frontend run start & gunicorn -k uvicorn.workers.UvicornWorker -w 2 backend.app.main:app"

#!/bin/bash

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
while ! pg_isready -h $DATABASE_HOST -U $DATABASE_USER; do
  sleep 1
done

echo "PostgreSQL is ready!"

# Check if database is already initialized
psql -h $DATABASE_HOST -U $DATABASE_USER -d $DATABASE_NAME -c "SELECT 1 FROM substations LIMIT 1" 2>/dev/null

if [ $? -ne 0 ]; then
  echo "Initializing database from backup..."
  psql -h $DATABASE_HOST -U $DATABASE_USER -d $DATABASE_NAME < /app/gridconnect_backup.sql
  echo "Database restored successfully!"
fi

echo "Starting application..."
uvicorn app.api:app --host 0.0.0.0 --port 8000
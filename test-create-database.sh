#!/usr/bin/env bash

export PGUSER="statengine"
export PGPASSWORD="statengine"
export DATABASE_NAME="statengine_test"

if [[ "$( psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DATABASE_NAME'" )" = '1' ]]; then
  ./test-drop-database.sh
fi

createdb -w "$DATABASE_NAME"
echo "Database '$DATABASE_NAME' created!"

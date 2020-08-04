#!/usr/bin/env bash

export DATABASE_NAME="statengine_test"

dropdb -w "$DATABASE_NAME"
echo "Database '$DATABASE_NAME' dropped!"

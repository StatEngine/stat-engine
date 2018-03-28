#!/bin/bash

if [[ -z "${ON_PREMISE}" ]]; then
  echo 'Serving Cloud version'
  node ./dist/server/index.js
else
  echo 'Serving On-Premise version'
  gulp serve:onPremise
fi

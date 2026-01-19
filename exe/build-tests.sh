#!/usr/bin/env bash

rm -rf dist/*
npx tsc
npx babel ./dist/tsc --out-dir ./dist/babel
npx babel ./dist/tsc/prisma/json --out-dir ./dist/babel/prisma/json --copy-files
jest
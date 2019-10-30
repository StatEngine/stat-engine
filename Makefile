# Makefile for building stat-engine

ORG ?= prominentedgestatengine
REPO ?= statengine
ENVIRONMENT ?= development

SHA=$(shell git rev-parse --short HEAD)
BRANCH=$(shell git rev-parse --symbolic-full-name --abbrev-ref HEAD)

TAG=${BRANCH}-${SHA}-${ENVIRONMENT}
NOW=$(shell date -u +%FT%TZ)

build:
	docker build \
	-t $(ORG)/$(REPO):${TAG} \
	--build-arg MAPBOX_TOKEN=${MAPBOX_TOKEN} \
	--build-arg AMPLITUDE_API_KEY=${AMPLITUDE_API_KEY} \
	--build-arg BUILD_VERSION=${TAG} \
  --build-arg BUILD_DATE=${NOW} \
	--network=host \
	--no-cache \
	.
	echo "TAG=${TAG}" > tag.properties

push:
	docker push \
	$(ORG)/$(REPO):${TAG}

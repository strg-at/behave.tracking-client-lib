VERSION = $(shell git describe --abbrev=0)
MAJOR_VERSION = $(shell git describe --abbrev=0 | cut -d. -f1)
MINOR_VERSION = $(shell git describe --abbrev=0 | cut -d. -f2)
REVISION = $(shell git describe --abbrev=0 | cut -d. -f3)
TAG = eu.gcr.io/logical-sled-220910/strg/behave/tracking-client

.PHONY: nothing test coverage build ship coverage-html install all version

nothing:

test:

coverage:

coverage-html:

lint:
	npm run lint

build:
	-make lint
	docker build -t $(TAG):$(VERSION) .
	docker tag $(TAG):$(VERSION) $(TAG):latest
	docker tag $(TAG):$(VERSION) $(TAG):$(MAJOR_VERSION)
	docker tag $(TAG):$(VERSION) $(TAG):$(MAJOR_VERSION).$(MINOR_VERSION)

ship:
	 docker push $(TAG):latest
	 docker push $(TAG):$(MAJOR_VERSION)
	 docker push $(TAG):$(MAJOR_VERSION).$(MINOR_VERSION)
	 docker push $(TAG):$(VERSION)

install:
	npm install

all:
	make build
	make ship

version:
	npm version $(type)

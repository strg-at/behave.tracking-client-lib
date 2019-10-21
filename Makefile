VERSION = $(shell git describe --abbrev=0)
MAJOR_VERSION = $(shell git describe --abbrev=0 | cut -d. -f1)
MINOR_VERSION = $(shell git describe --abbrev=0 | cut -d. -f2)
REVISION = $(shell git describe --abbrev=0 | cut -d. -f3)
TAG = eu.gcr.io/logical-sled-220910/strg/behave/tracking-client

.PHONY: nothing test coverage build ship coverage-html install all version

# https://gist.github.com/prwhite/8168133
help: ##This help dialog.
	@awk 'BEGIN {FS = ":.*##"; printf "target\t\t\t\thelp\n"; printf "------\t\t\t\t----\n"} /^[a-zA-Z_-]+:.*?##/ { printf "\033[36m%-10s\033[0m\t\t\t%s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

test:	##Run unit tests.
	npm run test

coverage:	##Run test coverage report.
	@echo "Uses 'make test' to check coverage"
	make test

coverage-html:	##Run interactive HTML coverage report.
ifdef force
	-make test
else
	make test
endif
	npm run coverage

lint:	##Run code linter.
	npm run lint

build:	##Run build process and create docker images.
ifdef force
	-make test
	-make lint
else
	make test
	make lint
endif
	npm run build
	docker build -t $(TAG):$(VERSION) .
	docker tag $(TAG):$(VERSION) $(TAG):latest
	docker tag $(TAG):$(VERSION) $(TAG):$(MAJOR_VERSION)
	docker tag $(TAG):$(VERSION) $(TAG):$(MAJOR_VERSION).$(MINOR_VERSION)

ship:	##Push docker images.
	 docker push $(TAG):latest
	 docker push $(TAG):$(MAJOR_VERSION)
	 docker push $(TAG):$(MAJOR_VERSION).$(MINOR_VERSION)
	 docker push $(TAG):$(VERSION)

install: ##Install the application.
	npm install

all: ##Build and ship.
ifdef force
	make force=1 build
else
	make build
endif
	make ship

version:	##increase vesion type=(major|minor|patch).
	npm version $(type)

run: ##Run application.
	npm start

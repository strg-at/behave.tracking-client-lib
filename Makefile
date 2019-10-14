VERSION = $(shell git describe --abbrev=0)
MAJOR_VERSION = $(shell git describe --abbrev=0 | cut -d. -f1)
MINOR_VERSION = $(shell git describe --abbrev=0 | cut -d. -f2)
REVISION = $(shell git describe --abbrev=0 | cut -d. -f3)
TAG = eu.gcr.io/logical-sled-220910/strg/behave/tracking-client

.PHONY: nothing test coverage build ship coverage-html install all version

# https://gist.github.com/prwhite/8168133
help: ## This help dialog.
	@IFS=$$'\n' ; \
	help_lines=(`fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##/:/'`); \
	printf "%-30s %s\n" "target" "help" ; \
	printf "%-30s %s\n" "------" "----" ; \
	for help_line in $${help_lines[@]}; do \
		IFS=$$':' ; \
		help_split=($$help_line) ; \
		help_command=`echo $${help_split[0]} | sed -e 's/^ *//' -e 's/ *$$//'` ; \
		help_info=`echo $${help_split[2]} | sed -e 's/^ *//' -e 's/ *$$//'` ; \
		printf '\033[36m'; \
		printf "%-30s %s" $$help_command ; \
		printf '\033[0m'; \
		printf "%s\n" $$help_info; \
	done

test:	## Run unit tests.
	npm run test

coverage:	## Run test coverage report.
	@echo "Uses 'make test' to check coverage"
	make test

coverage-html:	## Run interactive HTML coverage report.
ifdef ignore-test
	-make test
else
	make test
endif
	npm run coverage

lint:	## Run code linter.
	npm run lint

build:	## Run build process and create docker images.
ifdef ignore-test
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

ship:	## Push docker images.
	 docker push $(TAG):latest
	 docker push $(TAG):$(MAJOR_VERSION)
	 docker push $(TAG):$(MAJOR_VERSION).$(MINOR_VERSION)
	 docker push $(TAG):$(VERSION)

install: ## Install the application.
	npm install

all: ## Build and ship.
ifdef ignore-test
	make ignore-test=1 build
else
	make build
endif
	make ship

version:	## increase vesion type=(major|minor|patch).
	npm version $(type)

run: ## Run application.
	npm start

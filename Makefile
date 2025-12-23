BACKEND      := backend
FRONTEND     := frontend

VENV         := $(BACKEND)/venv
REQUIREMENTS := $(BACKEND)/requirements.txt

STATIC       := $(BACKEND)/static

NODE_MODULES := $(FRONTEND)/node_modules
NODE_PACKAGE := $(FRONTEND)/package.json
NODE_DIST    := $(FRONTEND)/dist
NODE_SOURCE  := $(FRONTEND)/src

.PHONY: all run setup clean

all: setup $(STATIC)

run: setup $(STATIC)
	$(VENV)/bin/uvicorn main:app --reload --app-dir $(BACKEND)

setup: $(VENV) $(NODE_MODULES)

$(VENV): $(REQUIREMENTS)
	[ -d $(VENV) ] || python3 -m venv $(VENV)
	$(VENV)/bin/pip install --upgrade pip
	$(VENV)/bin/pip install -r $(REQUIREMENTS)

$(NODE_MODULES): $(NODE_PACKAGE)
	npm install --prefix $(FRONTEND)

$(STATIC): $(NODE_DIST)
	rm -rf $(STATIC)
	cp -r  $(NODE_DIST)/. $(STATIC)

$(NODE_DIST): $(wildcard $(NODE_SOURCE)/* )
	npm run --prefix $(FRONTEND) build

clean:
	rm -rf $(VENV)
	rm -rf $(STATIC)
	rm -rf $(NODE_MODULES)
	rm -rf $(NODE_DIST)
	rm -rf $(BACKEND)/__pycache__
	rm -rf $(BACKEND)/routes/__pycache__

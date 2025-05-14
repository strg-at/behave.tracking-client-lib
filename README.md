# BeHave Tracking Client

This library contains the BeHave tracking client, it is intended to use it inside a client application integration and not standalone.

## Getting Started

### Prerequisites

- [Node 10](https://nodejs.org/)
- [NPM 6.4.1](https://www.npmjs.com/)

## Specification

The tracking client library register in a global namespace and forward all valid events to the BeHave tracking websocket server, invalid events will be droped. The library communicates with the BeHave.tracking-service.

## How to use

### config

```javascript
const config = {
  NAMESPACE: 'test',
  ENDPOINT: ' wss://behave.test.at/ws/event',
  RECONNECT_TIMEOUT: 60000,
  CLIENT_STORAGE_NAMESPACE: 'test',
}
```

### init

```javascript
import { TrackerAPI, TrackerService, TrackerWS, ClientStorage } from '@strg-behave/tracking-client-lib'

const ws = new TrackerWS(config)
const storage = new ClientStorage(config)
const service = new TrackerService(ws, storage, config)
const api = new TrackerAPI(service, config)
```

### track

The events can be send to the global namespace defined by `config.NAMESPACE`.

```javascript
// assume global namespace is `data`
data = data || []
let event = {
  key: 'test', // required
  value: 'test', // required
  time: Date.now(), // optional
  content: 'https://www.test.at', // optional keys will be passed as plain string
}
data.push(event)
```

Where `time` and `content` are optional parameters, `time` will be set (if not provided) inside tracking service layer. The value of `content` will be hashed as CRC32 checksum and passed to the WebSocket when set.

## Development

### Installation

```bash
npm install
```

### Testing

```bash
npm run test
```

### Coverage Report

Starts an interactive http server on port `8888`.

```bash
npm run coverage

```

### ESLint

To check the code syntax integrity according to our ESLint specification run:

```bash
npm run lint
```

To autofix code syntax integrity run:

```bash
npm run lint:fix
```

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the tags on this repository.

To increase a version and tag in GIT run:

```bash
npm version major|minor|patch
```

## Authors

- **Can Atesman** - _first implementation_
- **[Ralf Traunsteiner](mailto:ralf.traunsteiner@strg.at)** - _second implementation, rewritten most of the code parts and lot of improvements, starts decoupeling_
- **[Nils Müller](mailto:nils.mueller@strg.at)** - _reduced to tracking library functionality, reimplementation in layered architecture_

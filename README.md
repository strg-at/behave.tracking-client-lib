# BeHave Tracking Client
This library contains the BeHave tracking client, it is intended to use it inside a client application integration and not standalone.

## Getting Started

### Prerequisites
- [Node 10](https://nodejs.org/)
- [NPM 6.4.1](https://www.npmjs.com/)
<br>

## Specification
The tracking client library register in a global namespace and forward all valid events to the BeHave tracking websocket server, invalid events will be droped. The library communicates with [BeHave.tracking-service]().
<br>

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
<br>

### init
```javascript
import {
  TrackerAPI,
  TrackerService,
  TrackerWS,
  ClientStorage,
} from '@strg-behave/tracking-client-lib'

const ws = new TrackerWS(config)
const storage = new ClientStorage(config)
const service = new TrackerService(ws, storage, config)
const api = new TrackerAPI(service, config)
```
<br>

### track
The events can be send to the global namespace defined by `config.NAMESPACE`.
```javascript
// assume global namespace is `data`
data = data || []
let event = {
  key: 'test', // required
  value: 'test', // required
  time: Date.now(), // optional
  content: 'https://www.test.at', // optional, will be send as crc32
}
data.push(event)
```
Where `time` and `content` are optional parameters, `time` will be set (if not provided) inside tracking service layer. The value of `content` will be hashed as CRC32 checksum and passed to the WebSocket when set.
<br>


## Development

### Installation
```bash
npm install
```
<br>

### Testing
```bash
npm run test
```
<br>

### Coverage Report
Starts an interactive http server on port `8888`.
```bash
npm run coverage

```
<br>

### ESLint
To check the code syntax integrity according to our ESLint specification run:
```bash
npm run lint
```

To autofix code syntax integrity run:
```bash
npm run lint:fix
```
<br>

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the tags on this repository.
<br>
To increase a version and tag in GIT run:
```bash
npm version major|minor|patch
```
<br>

## Authors
* **Can Atesman** - *first implementation*
* **[Ralf Traunsteiner](mailto:ralf.traunsteiner@strg.at)** - *second implementation, rewritten most of the code parts and lot of improvements, starts decoupeling*
* **[Nils Müller](mailto:nils.mueller@strg.at)** - *reduced to tracking library functionality, reimplementation in layered architecture*

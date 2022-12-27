# Qlik Sense REST API

Interact with Qlik Sense REST APIs (Repository, Proxy, Engine and SaaS) from a single package (NodeJS/JavaScript)

![mocha](https://badges.aleen42.com/src/mocha.svg) ![tests](./test/badge.png)

## Not affiliated with Qlik

## Please check the [Wiki section](https://github.com/Informatiqal/qlik-rest-api/wiki) for details and examples

---

## Motivation

- communicate with multiple QS REST API services (not limited only to a single service) from single package
- support multiple authentication mechanisms (certificates, header, JWT etc) **The package itself is not performing authentication**

## Clients

- Repository (QSoW)
- Proxy (QSoW)
- Engine (QSoW)
- Generic (QSoW)
- SaaS (QSoK)

## Installation

`npm install --save qlik-rest-api`

> **Note**
> Node version >= 16.0.0

## Return data format

All requests are returning data in the following format:

```javascript
{
    data:  {} or []    // whatever is returned (including the error(s) details if error)
    status: number     // HTTP status codes: 200, 201, 204, 404, 409 etc.
    statusText: string // HTTP status text: "OK", "Created", "Bad Request" etc.
    message: string    // optional. In cese of an error this prop will be the raw message
}
```

## Basic examples

---

**Any "physical" content (like certificates, qvf files, extension files etc.) have to be provided in advance.
The package will not read any files from the file system by itself.**

### Proxy API (list all active sessions)

```javascript
import https from "https";
import { QlikProxyClient } from "../src/index";

const pfx = fs.readFileSync("path/to/client.pfx");

const httpsAgent = new https.Agent({
  pfx: pfx,
});

const config = {
  host: "my-sense-host",
  port: 4243,
  httpAgent: httpAgent,
  authentication: {
    user_dir: "SOME_DIR",
    user_name: "SOME_USER",
  },
};

const proxyClient = new QlikProxyClient(config);
const result = await proxyClient.Get("session");
```

### Engine API (healthcheck of single Engine)

```javascript
import https from "https";
import { QlikEngineClient } from "../src/index";

const pfx = fs.readFileSync("path/to/client.pfx");

const config = {
  host: "my-engine-host",
  port: 4747,
  httpAgent: new https.Agent({ pfx: pfx }),
  authentication: {
    user_dir: "SOME_DIR",
    user_name: "SOME_USER",
  },
};

const engineClient = new QlikProxyClient(config);
const result = await engineClient.Get("engine/healthcheck");
```

### Repository API (list app apps with filter)

```javascript
import fs from "fs";
import https from "https";
import { QlikRepositoryClient } from "qlik-rest-api";

const cert = fs.readFileSync(`path/to/client.pem`);
const key = fs.readFileSync(`path/to/client_key.pem`);

const httpsAgentCert = new https.Agent({
  rejectUnauthorized: false,
  cert: cert,
  key: key,
});

const config = {
  host: "my-sense-host.com",
  port: 4242,
  httpsAgent: httpsAgentCert,
  authentication: {
    user_dir: "SOME_DIR",
    user_name: "SOME_USER",
  },
};

const repoClient = new QlikRepositoryClient(config);

// list all apps with their name starting with "operations"
const qlikApps = await repoClient.Get(`app?filter=(name sw 'operations')`);
```

## Methods

---

Developer documentation for all methods can be found [here](https://informatiqal.github.io/qlik-rest-api/modules.html)

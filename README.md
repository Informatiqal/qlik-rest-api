[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/T6T0148ZP)

## Qlik Sense REST API (Node/JavaScript)

Interact with Qlik Sense REST APIs (Repository, Proxy, Engine and SaaS) from a single package

**Under development!**

---

[Motivation](#Motivation)
[REST API Coverage](#REST-API-coverage)
[Installation](#Installation)
[Return data format](#Return-data-format)
[Node vs Browser](#Node-vs-Browser)
[Examples](#Examples)

- [Certificates authentication](#Certificates-authentication)
- [Header authentication](#Header-authentication)
- [JWT authentication](#JWT-authentication)
- [Session authentication](#Session-authentication)
- [Ticket authentication](#Ticket-authentication)
- [Proxy API](#Proxy-API)
- [Engine API](#Engine-API)
- [Generic REST client](#Generic-REST-client)

[Supported authentication methods](#Supported-authentication-methods)

## Motivation

The short answer ... I needed it :D

Long(er) answer:

- communicate with multiple QS REST API services (not limited only to a single service) from single package
- support multiple authentication mechanisms (certificates, header, JWT etc) **The package itself is not performing authentication**
- good project to skill up my `TypeScript`

## REST API coverage

- [x] Repository (QSoW)
- [x] Proxy (QSoW)
- [x] Engine (QSoW)
- [x] Generic (QSoW)
- [ ] SaaS (QSoK) (TBA)
- [ ] Engine JSON API through REST API (not guaranteed)

---

# Installation

> `npm install qlik-rest-api@beta`

**Any "physical" content (like certificates, qvf files, extension files etc) have to be provided in advance.**
The package communicates with Qlik only and will not read files from the file system. Its not its job ... and make life easier when the package is used in the browser :)

# Return data format

All requests are returning data in the following format:

```javascript
{
    data:  {} or []    // depends what Qlik is returning
    status: number     // HTTP status codes: 200, 201, 204, 404, 409 etc.
    statusText: string // HTTP status text: "OK", "Created", "No content" etc.
}
```

# Node vs Browser

The package itself can be used from both environments (Node and Browser). The only difference is when using certificates authentication. In order to provide certificates the package accept additional parameter - `httpAgent`. This means that certificate authentication can be used only in Node environment.
The downside of this. When communicating with Qlik through the browser then:

- no certificate authentication
- certificate errors can be ignored (for example self-signed or expired certificates)

The following code demonstrates how to pass `httpsAgent`:

```javascript
import fs from "fs";
import https from "https";

// read the certificates
const crt = fs.readFileSync("path/to/certificate.pem");
const key = fs.readFileSync("path/to/certificate_key.pem");

// init https agent
let httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  cert: crt,
  key: key,
});

// create our config by passing the created httpAgent
let config = {
  host: "my-qlik-sense-instance",
  port: 4242,
  httpsAgent: httpsAgent,
  authentication: {
    user_dir: "SOME_DIR",
    user_name: "SOME_USER",
  },
};

// use the config
let repoClient = new QlikRepositoryClient(config);
let result = await repoClient.Get("about");
```

# Examples

- ## Certificates authentication

  See [Node vs Browser](#Node-vs-Browser)

- ## Header authentication

  ```javascript
  // header authentication
  import { QlikRepositoryClient } from "../src/index";

  let config = {
    host: "my-sense-host",
    proxy: "proxy-prefix",
    authentication: {
      header: "header-name",
      user: "directory\\user", //(or in whatever format the user is)
    },
  };

  let repoClient = new QlikRepositoryClient(config);
  let result = await repoClient.Get("about");
  ```

- ## JWT authentication

  ```javascript
  // JWT authentication
  import { QlikRepositoryClient } from "../src/index";

  let config = {
    host: "my-sense-host",
    proxy: "jwt-proxy-prefix",
    authentication: {
      token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2...",
    },
  };

  let repoClient = new QlikRepositoryClient(config);
  let result = await repoClient.Get("about");
  ```

- ## Session authentication

  ```javascript
  // Session authentication
  import { QlikRepositoryClient } from "../src/index";

  let config = {
    host: "my-sense-host",
    proxy: "jwt-proxy-prefix",
    authentication: {
      sessionId: "xxxxxxxx-xxx-xxx-xxxx-xxxxxxxxxxxx",
      cookieHeaderName: "X-Qlik-Session", // whatever is set in the virtual proxy
    },
  };

  let repoClient = new QlikRepositoryClient(config);
  let result = await repoClient.Get("about");
  ```

- ## Ticket authentication

  ```javascript
  // Ticket authentication
  import { QlikRepositoryClient } from "../src/index";

  let config = {
    host: "my-sense-host",
    authentication: {
      ticket: "some-ticket-value",
    },
  };

  let repoClient = new QlikRepositoryClient(config);
  let result = await repoClient.Get("about");
  ```

- ## Proxy API

  ```javascript
  import https from "https";
  import { QlikProxyClient } from "../src/index";

  const pfx = fs.readFileSync("path/to/client.pfx");

  let httpsAgent = new https.Agent({
    pfx: pfx,
  });

  let config = {
    host: "my-sense-host",
    port: 4243,
    httpAgent: httpAgent,
    authentication: {
      user_dir: "SOME_DIR",
      user_name: "SOME_USER",
    },
  };

  let proxyClient = new QlikProxyClient(config);
  let result = await proxyClient.Get("session");
  ```

- ## Engine API

  ```javascript
  import https from "https";
  import { QlikEngineClient } from "../src/index";

  const pfx = fs.readFileSync("path/to/client.pfx");

  let config = {
    host: "my-sense-host",
    port: 4747,
    httpAgent: new https.Agent({ pfx: pfx }),
    authentication: {
      user_dir: "SOME_DIR",
      user_name: "SOME_USER",
    },
  };

  let engineClient = new QlikProxyClient(config);
  let result = await engineClient.Get("engine/healthcheck");
  ```

- ## Generic REST client

  All other clients are adding the required service prefix automatically (for example `qrs`, `qps` and `api`). Some other REST request dont need prefix. In these cases the `Generic REST client` can be used. In general this client can be used as replacement for all other clients by adding the necessary prefix to the url

  ```javascript
  import https from "https";
  import { QlikGenericRestClient } from "../src/index";

  const pfx = fs.readFileSync("path/to/client.pfx");

  let config = {
    host: "my-sense-host",
    port: 4747,
    httpAgent: new https.Agent({ pfx: pfx }),
    authentication: {
      user_dir: "SOME_DIR",
      user_name: "SOME_USER",
    },
  };

  let genericClient = new QlikGenericRestClient(config);
  let result = await genericClient.Get("engine/healthcheck");
  ```

---

## Supported authentication methods

**This package is not performing authentication by itself!**

- [x] Certificates (only in Node environment by providing `https.agent`)
- [x] Header
- [x] JWT
- [x] Session
- [x] Ticket

---

**NOT AFFILIATED WITH QLIK**

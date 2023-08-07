import { describe, it, expect } from "vitest";
import {
  Util,
  TagOperations,
  ProxySessionOperation,
  // EngineOperations,
} from "../../test/util";

const util = new Util(true);

import {
  QlikGenericRestClient,
  // QlikEngineClient,
  // QlikGenericRestClient,
  QlikProxyClient,
  QlikRepositoryClient,
} from "../../src/index";
// import { IHeaderConfig } from "../../src/interfaces/interfaces";

describe("QSEoW (Certificates)", function () {
  it("Repository (Certificates) - DELETE, GET, POST and PUT (Tag)", async function () {
    const repo = new QlikRepositoryClient(util.baseConfig);

    const tagOperations = new TagOperations(repo);
    const { newTagData, getTagData, deleteTagData, updateTagData } =
      await tagOperations.run();

    expect(newTagData.status).to.be.eq(201) &&
      expect(getTagData.status).to.be.eq(200) &&
      expect(getTagData.data[0].id).to.be.eq(newTagData.data.id) &&
      expect(updateTagData.status).to.be.eq(200) &&
      expect(updateTagData.data.name).to.be.eq(tagOperations.tagNewName) &&
      expect(deleteTagData.status).to.be.eq(204);
  });

  it("Proxy (Certificates) - DELETE, GET, POST and PUT (Session)", async function () {
    let localConfig = { ...util.baseConfig };
    localConfig.port = 4243;

    const proxy = new QlikProxyClient(localConfig);

    const proxyOperations = new ProxySessionOperation(proxy);
    const { newSessionData, deleteSessionData, getSessionData } =
      await proxyOperations.run();

    expect(newSessionData.status).to.be.eq(201) &&
      expect(getSessionData.status).to.be.eq(200) &&
      expect(getSessionData.data.id).to.be.eq(undefined) &&
      expect(deleteSessionData.status).to.be.eq(200);
  });

  it("Proxy (Certificates) - GET (Sessions)", async function () {
    let localConfig = { ...util.baseConfig };
    localConfig.port = 4243;

    const proxy = new QlikProxyClient(localConfig);

    const proxyOperations = new ProxySessionOperation(proxy);
    const sessions = await proxyOperations.getSessionAll();

    expect(sessions.status).to.be.eq(200);
  });

  it("Engine (Certificates) - GET (Healthcheck)", async function () {
    const repo = new QlikRepositoryClient(util.baseConfig);
    const opsMonitorApps = await repo.Get(
      "app/hublist?filter=name eq 'Operations Monitor'",
    );

    //TODO: proper expect here
    expect(true).to.be.true;
  });

  it("Generic client with base path", async function () {
    const config = { ...util.baseConfig };
    config.port = 9098;

    const odag = new QlikGenericRestClient(config, "v1");

    const odagAboutResponse = await odag.Get<{}>("about").then((d) => d.data);

    expect(odagAboutResponse.hasOwnProperty("apiVersion")).to.be.true;
  });
});

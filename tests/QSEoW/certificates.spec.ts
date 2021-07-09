import chai from "chai";
import {
  Util,
  TagOperations,
  ProxySessionOperation,
  EngineOperations,
} from "../../tests/util";

const expect = chai.expect;
const util = new Util(true);

import {
  QlikEngineClient,
  //   QlikGenericRestClient,
  QlikProxyClient,
  QlikRepositoryClient,
} from "../../src/index";

describe("QSEoW (Certificates)", function () {
  this.timeout(30000);
  it("Repository (Certificates) - DELETE, GET, POST and PUT (Tag)", async function () {
    const repo = new QlikRepositoryClient(util.baseConfig);

    const tagOperations = new TagOperations(repo);
    const {
      newTagData,
      getTagData,
      deleteTagData,
      updateTagData,
    } = await tagOperations.run();

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
    const {
      newSessionData,
      deleteSessionData,
      getSessionData,
    } = await proxyOperations.run();

    expect(newSessionData.status).to.be.eq(201) &&
      expect(getSessionData.status).to.be.eq(200) &&
      expect(getSessionData.data.id).to.be.undefined &&
      expect(deleteSessionData.status).to.be.eq(200);
  });

  it("Proxy (Certificates) - GET (Sessions)", async function () {
    let localConfig = { ...util.baseConfig };
    localConfig.port = 4243;

    const proxy = new QlikProxyClient(localConfig);

    const proxyOperations = new ProxySessionOperation(proxy);
    const sessions = await proxyOperations.getSessionAll();

    expect(sessions.status).to.be.eq(201);
  });

  it("Engine (Certificates) - GET (Healthcheck)", async function () {
    // TBA
    expect(true).to.be.true;
  });
});

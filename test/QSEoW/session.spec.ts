import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Util, TagOperations, ProxySessionOperation } from "../../test/util";
import { QlikProxyClient, QlikRepositoryClient } from "../../src/index";
import { ISessionConfig } from "../../src/interfaces/interfaces";

const globalUtil = new Util(true);

let localConfig;
let proxyOperations;
let proxyClient;

describe("QSEoW (Session)", function () {
  // before each test create proxy session
  beforeEach(async function () {
    let localProxyConfig = { ...globalUtil.baseConfig };
    localProxyConfig.port = 4243;

    const proxyClientTemp = new QlikProxyClient(localProxyConfig);
    const proxyOperationsTemp = new ProxySessionOperation(proxyClientTemp);
    const sessionId = await proxyOperationsTemp.createSession().then((sessionDetails) => sessionDetails.data.SessionId);

    const localUtil = new Util(false);
    let localConfigTemp = { ...localUtil.baseConfigSession };

    (localConfigTemp.authentication as ISessionConfig).sessionId = sessionId;

    localConfig = localConfigTemp;
    proxyOperations = proxyOperationsTemp;
    proxyClient = proxyClientTemp;
  });

  // after each test delete the session and null the manually set values
  afterEach(async function () {
    await proxyOperations.deleteSession(localConfig.authentication.sessionId);

    proxyClient = undefined;
    proxyOperations = undefined;
    localConfig = undefined;
  });

  it("Repository (Session) - DELETE, GET, POST and PUT (Tag)", async function () {
    let a = 1;
    const repo = new QlikRepositoryClient(localConfig);

    const tagOperations = new TagOperations(repo);
    const { newTagData, getTagData, deleteTagData, updateTagData } = await tagOperations.run();

    expect(newTagData.status).to.be.eq(201) &&
      expect(getTagData.status).to.be.eq(200) &&
      expect(getTagData.data[0].id).to.be.eq(newTagData.data.id) &&
      expect(updateTagData.status).to.be.eq(200) &&
      expect(updateTagData.data.name).to.be.eq(tagOperations.tagNewName) &&
      expect(deleteTagData.status).to.be.eq(204);
  });

  /**
   * Get info about the logged in user
   */
  it("Proxy (Session)", async function () {
    const util = new Util(false);
    let sessionConfig = { ...util.baseConfigSession };
    (sessionConfig.authentication as ISessionConfig).sessionId = localConfig.authentication.sessionId;

    const proxyClient = new QlikProxyClient(sessionConfig);
    const userInfo = await proxyClient.Get<{ logoutUri: string }>("user");

    expect(userInfo.status).to.be.eq(200) && expect(userInfo.data.logoutUri).to.not.be.false;
  });
});

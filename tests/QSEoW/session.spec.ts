import chai from "chai";
import { Util, TagOperations, ProxySessionOperation } from "../../tests/util";
import { QlikProxyClient, QlikRepositoryClient } from "../../src/index";
import { ISessionConfig } from "../../src/interfaces/interfaces";

const expect = chai.expect;
const globalUtil = new Util(true);

describe("QSEoW (Session)", function () {
  this.timeout(30000);
  // before each test create proxy session
  beforeEach(async function () {
    let localProxyConfig = { ...globalUtil.baseConfig };
    localProxyConfig.port = 4243;

    const proxyClient = new QlikProxyClient(localProxyConfig);
    const proxyOperations = new ProxySessionOperation(proxyClient);
    const sessionId = await proxyOperations
      .createSession()
      .then((sessionDetails) => sessionDetails.data.SessionId);

    const localUtil = new Util(false);
    let localConfig = { ...localUtil.baseConfigSession };

    (localConfig.authentication as ISessionConfig).sessionId = sessionId;

    this.localConfig = localConfig;
    this.proxyOperations = proxyOperations;
    this.proxyClient = proxyClient;
  });

  // after each test delete the session and null the manually set values
  afterEach(async function () {
    await this.proxyOperations.deleteSession(
      this.localConfig.authentication.sessionId
    );

    this.proxyClient = undefined;
    this.proxyOperations = undefined;
    this.localConfig = undefined;
  });

  it("Repository (Session) - DELETE, GET, POST and PUT (Tag)", async function () {
    const repo = new QlikRepositoryClient(this.localConfig);

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

  /**
   * Get info about the logged in user
   */
  it("Proxy (Session)", async function () {
    const util = new Util(false);
    let sessionConfig = { ...util.baseConfigSession };
    (sessionConfig.authentication as ISessionConfig).sessionId = this.localConfig.authentication.sessionId;

    const proxyClient = new QlikProxyClient(sessionConfig);
    const userInfo = await proxyClient.Get("user");

    expect(userInfo.status).to.be.eq(200) &&
      expect(userInfo.data.logoutUri).to.not.be.false;
  });
});

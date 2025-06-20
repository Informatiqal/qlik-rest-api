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
import { IncomingMessage } from "http";
import { createWriteStream } from "fs";
// import { IHeaderConfig } from "../../src/interfaces/interfaces";

describe("QSEoW (Certificates)", function () {
  it("Repository (Certificates) - DELETE, GET, POST and PUT (Tag)", async function () {
    const repo = new QlikRepositoryClient(util.baseConfig);

    const tagOperations = new TagOperations(repo);
    const { newTagData, getTagData, deleteTagData, updateTagData } = await tagOperations.run();

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
    const { newSessionData, deleteSessionData, getSessionData } = await proxyOperations.run();

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
    const opsMonitorApps = await repo.Get("app/hublist?filter=name eq 'Operations Monitor'");

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

  it("TEMP", async function () {
    const repo = new QlikRepositoryClient(util.baseConfig);
    const gen = new QlikGenericRestClient(util.baseConfig);

    const token = "e4a7cde6-81de-440f-9dee-8895478a0f21";

    const props = {
      token: "",
      skipData: false,
    };

    if (!props.token) props.token = token;

    const downloadPath: string = await repo
      .Post<{ downloadPath: string }>(`app/cd67fad4-8caa-457d-bbb6-472737025e6a/export/${props.token}`, {})
      .then((response) => response.data)
      .then((data) => data.downloadPath.replace("/tempcontent", "tempcontent"));

    return await gen.Get<IncomingMessage>(downloadPath, "", "stream").then(async (r) => {
      let a = 1;

      await new Promise((resolve, reject) => {
        const fileWriteStream = createWriteStream("d:/dev/blah/test.qvf");

        (r.data as IncomingMessage).pipe(fileWriteStream).on("finish", resolve).on("error", reject);
      });

      return {
        file: r.data,
        exportToken: props.token ?? token,
        id: `some-id`,
        name: `test.qvf`,
      };
    });
  });

  it("TEMP1", async function () {
    const repo = new QlikRepositoryClient(util.baseConfig);
    const downloadPath: string = await repo
      .Post<any>(`tag/table`, {
        entity: "tag",
        columns: [
          {
            columnType: "Property",
            definition: "id",
            name: "id",
          },
          {
            columnType: "Function",
            definition:
              "Count(EngineService,PrintingService,ProxyService,VirtualProxyConfig,RepositoryService,SchedulerService,ServerNodeConfiguration,App,App.Object,ReloadTask,ExternalProgramTask,UserSyncTask,SystemRule,Stream,User,UserDirectory,DataConnection,Extension,ContentLibrary)",
            name: "occurrences",
          },
        ],
      })
      .then((response) => {
        let a = 1;
        return response.data;
      })
      .catch((e) => {
        let a = 1;
      });
  });
});

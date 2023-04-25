import chai from "chai";
import { Util, TagOperations } from "../../test/util";

const expect = chai.expect;
const util = new Util();

import {
  QlikRepositoryClient,
  QlikEngineClient,
  QlikGenericRestClient,
} from "../../src/index";

describe("QSEoW (Header)", function () {
  this.timeout(30000);
  it("Repository (Header) - DELETE, GET, POST and PUT (Tag)", async function () {
    const repo = new QlikRepositoryClient({ ...util.baseConfigHeader });

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

  it("Engine (Header) - GET (Healthcheck)", async function () {
    let engine = new QlikEngineClient({ ...util.baseConfigHeader, port: 443 });
    let result = await engine.Get<{ version: string }>("engine/healthcheck");

    expect(result.status).to.be.eq(200) &&
      expect(result.data?.version).to.not.be.empty;
  });

  it("Generic (Header) - GET (Healthcheck)", async function () {
    let generic = new QlikGenericRestClient({
      ...util.baseConfigHeader,
      port: 443,
    });
    let result = await generic.Get<{ version: string }>(
      "api/engine/healthcheck"
    );

    expect(result.status).to.be.eq(200) &&
      expect(result.data?.version).to.not.be.empty;
  });

  it("Raw http error", async function () {
    const repo = new QlikRepositoryClient(util.baseConfigHeaderWrongURL);

    const promises = [
      repo.Get("tag").catch((e) => e.message),
      repo.Post("tag", {}).catch((e) => e.message),
      repo.Delete("tag").catch((e) => e.message),
      repo.Put("tag", {}).catch((e) => e.message),
      repo.Patch("tag", {}).catch((e) => e.message),
    ];

    const result: string[] = await Promise.all(promises);

    expect(result[0].indexOf("ENOTFOUND")).to.be.greaterThan(-1) &&
      expect(result[1].indexOf("ENOTFOUND")).to.be.greaterThan(-1) &&
      expect(result[2].indexOf("ENOTFOUND")).to.be.greaterThan(-1) &&
      expect(result[3].indexOf("ENOTFOUND")).to.be.greaterThan(-1) &&
      expect(result[4].indexOf("ENOTFOUND")).to.be.greaterThan(-1);
  });
});

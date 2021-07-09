import chai from "chai";
import { Util, TagOperations } from "../../tests/util";

const expect = chai.expect;
const util = new Util();

import { QlikRepositoryClient } from "../../src/index";

describe("QSEoW (JWT)", function () {
  this.timeout(30000);
  it("Repository (JWT) - DELETE, GET, POST and PUT (Tag)", async function () {
    const repo = new QlikRepositoryClient(util.baseConfigJWT);

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
});

import chai from "chai";
import { Util } from "../util";
import fs from "fs";
import { FormDataCustom } from "../../../qlik-saas-api/src/util/FormData";

const expect = chai.expect;
const util = new Util();

import { QlikSaaSClient } from "../../src/index";

describe("SaaS", function () {
  this.timeout(30000);
  it("Repository (JWT) - DELETE, GET, POST and PUT (Tag)", async function () {
    const saas = new QlikSaaSClient(util.baseConfigSaas);

    // const a = await saas.Get(`items?resourceType=app&limit=10`);
    // const a1 = await saas.Get(`items?resourceType=app`);
    const t = fs.readFileSync(
      "D:\\DEV\\Informatiqal\\qlik-saas-api\\casual.zip"
    );

    const fd = new FormDataCustom();
    fd.append(
      "data",
      JSON.stringify({
        tags: [],
      })
    );

    fd.append("file", t, "casual.zip");
    const data = fd.getData();

    let a = await saas
      .Post(`themes`, data, fd.headers)
      .then((res) => {
        let a = 1;
      })
      .catch((e) => {
        let a = 1;
      });

    // const tempLocation = await saas.Post(
    //   `apps/e40a69d5-c4ff-4512-b3ef-2ee3c004acf5/export`,
    //   {},
    //   "",
    //   "json",
    //   false,
    //   true
    // );

    // const appContent: string = await saas
    //   .Get(
    //     tempLocation.data.location.replace("/api/v1/", ""),
    //     "application/octet-stream",
    //     "arraybuffer"
    //   )
    //   .then((a) => a.data);

    // fs.writeFileSync(
    //   "C:\\Users\\countnazgul\\Documents\\Qlik\\Sense\\Apps\\load test 123.qvf",
    //   appContent
    // );

    // const qvfFile = fs.readFileSync(
    //   "C:\\Users\\countnazgul\\Documents\\Qlik\\Sense\\Apps\\load test.qvf"
    // );

    // const a1 = await saas.Post(
    //   "temp-contents/files",
    //   qvfFile,
    //   "application/octet-stream",
    //   "json",
    //   false,
    //   true,
    //   [
    //     {
    //       name: "Tus-Resumable",
    //       value: "1.0.0",
    //     },
    //     {
    //       name: "Upload-Length",
    //       value: qvfFile.length,
    //     },
    //     {
    //       name: "Upload-Metadata",
    //       value: "filename bG9hZCB0ZXN0LnF2Zg==",
    //     },
    //   ]
    // );

    // const a2 = await saas.Get(
    //   `apps/c1e6c393-34ab-44cb-833f-25c03676ac2f/data/metadata`
    // );

    // const a3 = await saas.Post(`apps`, {
    //   attributes: {
    //     name: "whatever",
    //     description: "string",
    //   },
    // });

    // const a5 = await saas.Put(`apps/${a3.data.attributes.id}`, {
    //   attributes: {
    //     name: "other whatever",
    //   },
    // });

    // const a6 = await saas.Delete(`apps/${a3.data.attributes.id}`);

    // expect(true).to.be.true;
    // const tagOperations = new TagOperations(repo);
    // const {
    //   newTagData,
    //   getTagData,
    //   deleteTagData,
    //   updateTagData,
    // } = await tagOperations.run();

    // expect(newTagData.status).to.be.eq(201) &&
    //   expect(getTagData.status).to.be.eq(200) &&
    //   expect(getTagData.data[0].id).to.be.eq(newTagData.data.id) &&
    //   expect(updateTagData.status).to.be.eq(200) &&
    //   expect(updateTagData.data.name).to.be.eq(tagOperations.tagNewName) &&
    //   expect(deleteTagData.status).to.be.eq(204);
  });
});

import chai from "chai";
import { Util } from "../util";
import fs from "fs";
import { QlikFormData } from "../../src/helpers/FormData";

const expect = chai.expect;
const util = new Util();

import { QlikSaaSClient } from "../../src/index";

describe("SaaS", function () {
  this.timeout(30000);

  // Test retrieving paginated data by applying limit parameter
  it("Get, limit and paginate data", async function () {
    const saas = new QlikSaaSClient(util.baseConfigSaas);
    const limit = 10;

    const items = await saas.Get(`items?limit=${limit}`);

    expect(items.data.length).to.be.greaterThan(10);
  });

  // Uploading resources to SaaS (theme, extension etc) is done
  // via FormData. This test demonstrates how to use
  // the built-in QlikFormData class
  it("FormData upload", async function () {
    const saas = new QlikSaaSClient(util.baseConfigSaas);
    const themes = await saas.Get(`themes`);

    // If the theme already exists - remove it
    const themeExists = themes.data.filter((t) => t.name == "Casual");
    if (themeExists.length > 0)
      await saas.Delete(`themes/${themeExists[0].id}`);

    const theme = fs.readFileSync(process.env.THEME_PATH);
    const fd = new QlikFormData();
    fd.append(
      "data",
      JSON.stringify({
        tags: [],
      })
    );
    fd.append("file", theme, "casual.zip");

    const newTheme = await saas.Post(`themes`, fd.getData, fd.getHeaders);

    const deleteNewTheme = await saas.Delete(`themes/${newTheme.data.id}`);

    expect(newTheme.data).to.have.property("id") &&
      expect(deleteNewTheme.status).to.be.equal(204);
  });

  // Update and existing object in SaaS
  it("Update data", async function () {
    const saas = new QlikSaaSClient(util.baseConfigSaas);

    const newApp = await saas.Post("apps", {
      attributes: {
        name: "TEST App",
        description: "Qlik Rest API TEST",
      },
    });

    const updateAppName = await saas.Put(`apps/${newApp.data.attributes.id}`, {
      attributes: {
        name: "TEST App (updated)",
      },
    });

    const deleteApp = await saas.Delete(`apps/${newApp.data.attributes.id}`);

    expect(newApp.data.attributes).to.have.property("id") &&
      expect(updateAppName.data.attributes.name).to.be.equal(
        "TEST App (updated)"
      ) &&
      expect(deleteApp.status).to.be.equal(200);
  });

  // Upload file as temp content
  it("Uploading content with octet-stream ", async function () {
    const saas = new QlikSaaSClient(util.baseConfigSaas);

    // read the qvf as binary
    const qvfFile = fs.readFileSync(process.env.SAAS_QVF);
    //
    const appName = "License Monitor.qvf";
    const appNameEncoded = Buffer.from(appName).toString("base64");

    // upload the file to qlik's temp location
    const tempContentLocation = await saas.Post(
      "temp-contents/files",
      qvfFile,
      "application/octet-stream",
      "json",
      false,
      true,
      [
        {
          name: "Tus-Resumable",
          value: "1.0.0",
        },
        {
          name: "Upload-Length",
          value: qvfFile.length,
        },
        {
          name: "Upload-Metadata",
          value: `filename ${appNameEncoded}, ttl 10000`,
        },
      ]
    );

    // get the temp file details
    const contentDetails = await saas.Get(
      `temp-contents/${tempContentLocation.data.id}/details`
    );

    expect(qvfFile.length).to.be.equal(contentDetails.data.Size);
  });
});

import { describe, it, expect } from "vitest";
import { Util } from "../../test/util";

const util = new Util(true);

import { QlikRepositoryClient, QlikProxyClient } from "../../src/index";
import { ITicketConfig } from "../../src/interfaces/interfaces";

describe("QSEoW (Ticket)", function () {
  it("Repository (Ticket) - DELETE, GET, POST and PUT (About)", async function () {
    let localBaseConfig = { ...util.baseConfig };
    localBaseConfig.port = 4243;
    const proxy = new QlikProxyClient(localBaseConfig);
    const ticket = await proxy
      .Post<{ Ticket: string }>("ticket", {
        UserDirectory: `${process.env.SENSE_USER_DIRECTORY}`,
        UserId: `${process.env.SENSE_USER_NAME}`,
        Attributes: [],
      })
      .then((response) => response.data.Ticket);

    let localConfig = { ...util.baseConfigTicket };
    (localConfig.authentication as ITicketConfig).ticket = ticket;
    const repo = new QlikRepositoryClient(localConfig);

    const aboutData = await repo.Get<{ buildVersion: string }>("about");

    expect(aboutData.data.buildVersion).to.be.not.be.empty;
  });
});

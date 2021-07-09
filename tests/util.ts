import path from "path";
const dotEnvPath = path.resolve("./.env");
require("dotenv").config({ path: dotEnvPath });

import fs from "fs";
import https from "https";
import { generateUUID } from "../src/helpers/generic";

import { IConfig, IHttpReturn } from "../src/interfaces/interfaces";

export class Util {
  private crt: Buffer;
  private key: Buffer;
  private pfx: Buffer;

  private loadCertificates: boolean;

  public httpsAgentCert: any;
  public httpsAgentPfx: any;
  public httpsAgentSelfSigned: any;
  public baseConfig: IConfig;
  public baseConfigPxf: IConfig;
  public baseConfigHeader: IConfig;
  public baseConfigJWT: IConfig;
  public baseConfigSession: IConfig;
  public baseConfigTicket: IConfig;

  constructor(loadCertificates?: boolean) {
    this.loadCertificates = loadCertificates || false;
    this.crt = fs.readFileSync(`${process.env.TEST_CERT}/client.pem`);
    this.key = fs.readFileSync(`${process.env.TEST_CERT}/client_key.pem`);
    this.pfx = fs.readFileSync(`${process.env.TEST_CERT}/client.pfx`);

    this.setHttpsAgent();
    this.setConfig();
  }

  setHttpsAgent() {
    if (!this.loadCertificates) {
      this.httpsAgentCert = new https.Agent({
        rejectUnauthorized: false,
      });

      this.httpsAgentSelfSigned = new https.Agent({
        rejectUnauthorized: false,
      });

      return true;
    }

    this.httpsAgentCert = new https.Agent({
      rejectUnauthorized: false,
      cert: this.crt,
      key: this.key,
    });

    this.httpsAgentPfx = new https.Agent({
      rejectUnauthorized: false,
      pfx: this.pfx,
    });

    this.httpsAgentSelfSigned = new https.Agent({
      rejectUnauthorized: false,
    });
  }

  setConfig() {
    this.baseConfig = {
      host: process.env.TEST_HOST,
      port: 4242,
      httpsAgent: this.httpsAgentCert,
      authentication: {
        user_dir: process.env.SENSE_USER_DIRECTORY,
        user_name: process.env.SENSE_USER_NAME,
      },
    };

    this.baseConfig = {
      host: process.env.TEST_HOST,
      port: 4242,
      httpsAgent: this.httpsAgentCert,
      authentication: {
        user_dir: process.env.SENSE_USER_DIRECTORY,
        user_name: process.env.SENSE_USER_NAME,
      },
    };

    this.baseConfigPxf = {
      host: process.env.TEST_HOST,
      port: 4242,
      httpsAgent: this.httpsAgentPfx,
      authentication: {
        user_dir: process.env.SENSE_USER_DIRECTORY,
        user_name: process.env.SENSE_USER_NAME,
      },
    };

    this.baseConfigHeader = {
      host: process.env.TEST_HOST,
      proxy: process.env.AUTH_HEADER_PROXY,
      httpsAgent: this.httpsAgentSelfSigned,
      authentication: {
        header: process.env.AUTH_HEADER,
        user: process.env.AUTH_HEADER_USER,
      },
    };

    this.baseConfigJWT = {
      host: process.env.TEST_HOST,
      proxy: process.env.AUTH_JWT_PROXY,
      httpsAgent: this.httpsAgentSelfSigned,
      authentication: {
        token: process.env.AUTH_JWT_TOKEN,
      },
    };

    this.baseConfigSession = {
      host: process.env.TEST_HOST,
      httpsAgent: this.httpsAgentSelfSigned,
      authentication: {
        sessionId: "",
        cookieHeaderName: "X-Qlik-Session",
      },
    };

    this.baseConfigTicket = {
      host: process.env.TEST_HOST,
      httpsAgent: this.httpsAgentSelfSigned,
      authentication: {
        ticket: "",
      },
    };
  }

  generateUUID() {
    return generateUUID();
  }
}

export class TagOperations {
  private repoClient: any;
  public tagName = "Test Tag";
  public tagNewName = "TEST";

  constructor(repoClient: any) {
    this.repoClient = repoClient;
  }

  async run() {
    let newTagData = await this.newTag();
    let getTagData = await this.getTagInfo(newTagData.data.id);
    let updateTagData = await this.updateTag(getTagData);
    let deleteTagData = await this.deleteTag(newTagData.data.id);

    return {
      newTagData,
      getTagData,
      updateTagData,
      deleteTagData,
    };
  }

  async newTag(): Promise<IHttpReturn> {
    return await this.repoClient.Post(`tag`, {
      name: this.tagName,
    });
  }

  private async getTagInfo(tagId: string): Promise<IHttpReturn> {
    return await this.repoClient.Get(`tag/full?filter=(id eq ${tagId})`);
  }

  private async updateTag(tag: IHttpReturn): Promise<IHttpReturn> {
    let toUpdateInfo = { ...tag.data[0] };
    toUpdateInfo.name = this.tagNewName;
    return await this.repoClient.Put(`tag/${tag.data[0].id}`, toUpdateInfo);
  }

  private async deleteTag(tagId: string): Promise<IHttpReturn> {
    return await this.repoClient.Delete(`tag/${tagId}`);
  }
}

export class ProxySessionOperation {
  private proxyClient: any;

  constructor(proxyClient: any) {
    this.proxyClient = proxyClient;
  }

  async run() {
    let newSessionData = await this.createSession();
    let getSessionData = await this.getSession(newSessionData.data.SessionId);
    let deleteSessionData = await this.deleteSession(
      newSessionData.data.SessionId
    );

    return {
      newSessionData,
      getSessionData,
      deleteSessionData,
    };
  }

  async createSession() {
    let util = new Util();

    return await this.proxyClient.Post("session", {
      userDirectory: process.env.SENSE_USER_DIRECTORY,
      userId: process.env.SENSE_USER_NAME,
      sessionId: util.generateUUID(),
    });
  }

  private async getSession(sessionId: string) {
    return await this.proxyClient.Get(`session/${sessionId}`);
  }

  async getSessionAll() {
    return await this.proxyClient.Get(`session`);
  }

  async deleteSession(sessionId: string) {
    return await this.proxyClient.Delete(`session/${sessionId}`);
  }
}

export class EngineOperations {
  private engineClient: any;

  constructor(engineClient: any) {
    this.engineClient = engineClient;
  }

  async run() {}
}

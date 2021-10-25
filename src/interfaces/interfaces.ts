import { AxiosResponse } from "axios";

export interface ICertUser {
  user_dir?: string;
  user_name?: string;
}

export interface IHeaderConfig {
  header: string;
  user: string;
}

export interface IJWTConfig {
  token: string;
}

export interface ITicketConfig {
  ticket: string;
}

export interface ISessionConfig {
  sessionId: string;
  cookieHeaderName: string;
}

export interface ISaaSToken extends IJWTConfig {
  webIntegrationId?: string;
}

export interface IConfig {
  host: string;
  port?: number;
  proxy?: string;
  notSecure?: boolean;
  headers?: string[];
  // cookies?: string[];
  httpsAgent?: any;
  saasVersion?: number;
  authentication:
    | IHeaderConfig
    | IJWTConfig
    | ISessionConfig
    | ITicketConfig
    | ICertUser
    | ISaaSToken;
}

export interface IConfigFull extends IConfig {
  baseUrl: string;
}

export interface IHttpReturn {
  status: number;
  statusText: string;
  data: AxiosResponse<any>["data"];
}

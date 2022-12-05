import { AxiosResponse } from "axios";

export interface ICertUser {
  user_dir: string;
  user_name: string;
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

/**
 * Qlik SaaS M2M (Machine-to-machine) OAuth authentication
 */
export interface ISaaSOauthM2M {
  clientId: string;
  clientSecret: string;
}

export interface IConfig {
  host: string;
  port?: number;
  proxy?: string;
  notSecure?: boolean;
  headers?: string[];
  httpsAgent?: any;
  saasVersion?: number;
  authentication?:
    | IHeaderConfig
    | IJWTConfig
    | ISessionConfig
    | ITicketConfig
    | ICertUser
    | ISaaSToken
    | ISaaSOauthM2M;
}

export interface IConfigFull extends IConfig {
  baseUrl: string;
}

export interface IHttpReturn<T> {
  status: number;
  statusText: string;
  message?: string;
  data: AxiosResponse<T>["data"];
}

export interface IOauthTokenResponse {
  access_token: string;
  token_type: string;
  expires_at: string;
  expires_in: string;
}

export interface ISaaSErrorResponse {
  code: string;
  detail: string;
  status: string;
  title: string;
}

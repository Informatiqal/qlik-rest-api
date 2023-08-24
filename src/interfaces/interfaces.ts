import { AxiosResponse } from "axios";

export type IContext = "qmc" | "hub";

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
  /**
   * Qlik Sense host (name, ip etc.)
   */
  host: string;
  /**
   * Port number
   *
   * List of all ports:
   *
   * https://help.qlik.com/en-US/sense-admin/February2023/Subsystems/DeployAdministerQSE/Content/Sense_DeployAdminister/QSEoW/Deploy_QSEoW/Ports.htm
   */
  port?: number;
  /**
   * Virtual proxy prefix
   */
  proxy?: string;
  notSecure?: boolean;
  /**
   * Additional http headers to be send
   */
  headers?: string[];
  /**
   * Optional https agent (useful in Node.js environment)
   *
   * Ignore certificate issues, provide certificates etc
   */
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
  options?: {
    saas?: {
      apps?: {
        swapResourceIdAndId?: boolean;
      };
    };
  };
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

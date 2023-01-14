import {
  IConfigFull,
  IHeaderConfig,
  IJWTConfig,
  ISessionConfig,
  ITicketConfig,
  IHttpReturn,
  ICertUser,
  ISaaSToken,
  IContext,
} from "../interfaces/interfaces";

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  ResponseType,
} from "axios";

import {
  generateQlikUserHeader,
  generateXrfkey,
  setURLXrfKey,
  setQlikTicket,
} from "../helpers/generic";
import { Edition } from "../clients/BaseClient";

export class MakeRequest {
  configFull: IConfigFull;
  requestConfig: AxiosRequestConfig;
  xrfKey: string;
  qlikTicket: string;
  instance: AxiosInstance;
  private followLocation: boolean;
  private returnLocation: boolean;
  private edition: Edition;

  constructor(
    configFull: IConfigFull,
    edition: Edition,
    followLocation?: boolean,
    returnLocation?: boolean
  ) {
    if (!configFull.host) throw new Error(`Missing or empty "host" property`);

    this.configFull = configFull;
    this.edition = edition;
    this.followLocation = followLocation || true;
    this.returnLocation = returnLocation || false;

    this.requestConfig = {
      url: "",
      method: "GET",
      headers: {
        "Content-Type": "",
        "X-Qlik-Xrfkey": "",
      },
    };

    const instance = axios.create();
    this.instance = instance;
    this.instance.interceptors.response.use(
      async function (response: AxiosResponse) {
        // Qlik SaaS have rate limits
        // whenever the rate limit is reached the response will be
        // with status 429 and retry-after header should be available
        if (response.status == 429) {
          const retryAfter =
            (response.headers["retry-after"] as unknown as number) || -1;
          const retryAfterMessage =
            retryAfter > -1 ? ` Retry after ${retryAfter} second(s)` : "";

          throw new Error(`Rate limit reached.${retryAfterMessage}`);
        }

        if (!response.headers.location) return response;

        if (response.headers.location && followLocation) {
          const redirectConfig: AxiosRequestConfig = {
            method: "get",
            responseType: "arraybuffer",
            url: `${response.config.baseURL}${response.headers.location}`,
            headers: {
              Authorization: response.config.headers["Authorization"],
            },
          };

          return await instance(redirectConfig);
        }

        if (response.headers.location && !followLocation) {
          if (returnLocation) {
            response.data = {
              location: response.headers.location,
              id:
                response.headers.location.indexOf("/temp-contents/files") > -1
                  ? response.headers.location.split("/").pop()
                  : null,
            };
          }

          return response;
        }

        throw new Error(`Something went wrong while processing the response`);
      },

      function (e: AxiosError) {
        if (e.response && e.response.data) {
          throw {
            status: e.response.status,
            statusText: e.response.statusText,
            message: e.message,
            data: e.response.data,
          };
        }

        if (e.response)
          throw {
            status: e.response.status,
            statusText: e.response.statusText,
            message: e.message,
            data: "",
          };

        throw {
          status: undefined,
          statusText: undefined,
          message: e.message,
          data: "",
        };
      }
    );

    if (this.edition == "saas") {
      this.instance.interceptors.response.use(
        this.SaasPagingInterceptor,
        function (e: AxiosError) {
          throw e;
        }
      );
    }

    if (this.configFull.httpsAgent)
      this.requestConfig.httpsAgent = this.configFull.httpsAgent;

    if (this.configFull.authentication?.hasOwnProperty("header"))
      this.SetHeader();

    if (this.configFull.authentication?.hasOwnProperty("token")) this.SetJWT();

    if (this.configFull.authentication?.hasOwnProperty("sessionId"))
      this.SetSession();

    if (this.configFull.authentication?.hasOwnProperty("user_name"))
      this.SetUserHeader();

    if (this.configFull.authentication?.hasOwnProperty("ticket"))
      this.SetTicket();

    this.xrfKey = generateXrfkey();
  }

  PrepareRequestConfig(
    url: string,
    contentType = "application/json",
    responseType?: ResponseType,
    additionalHeaders?: { name: string; value: any }[],
    context?: IContext
  ): void {
    this.requestConfig.url = setQlikTicket(url, this.qlikTicket);
    if (this.requestConfig.url.indexOf("api/v1/") == -1) {
      this.requestConfig.headers["X-Qlik-Xrfkey"] = this.xrfKey;
      this.requestConfig.url = setURLXrfKey(
        this.requestConfig.url,
        this.xrfKey
      );
    } else {
      delete this.requestConfig.headers["X-Qlik-Xrfkey"];
    }
    if (contentType) this.requestConfig.headers["Content-Type"] = contentType;
    if (responseType) this.requestConfig.responseType = responseType;

    if (additionalHeaders && additionalHeaders.length > 0)
      additionalHeaders.map((header) => {
        try {
          this.requestConfig.headers[header.name] = header.value;
        } catch (e) {
          throw new Error(
            `Unable to add header "${header.name}" with value "${header.value}" to the request`
          );
        }
      });

    if (context) {
      if (context != "hub" && context != "qmc")
        throw new Error(
          `Unknown context values. Allowed values are "hub" and "qmc". Provided was "${context}"`
        );

      this.requestConfig.headers["X-Qlik-Security"] =
        context == "hub" ? "Context=AppAccess" : "Context=ManagementAccess";
    }
  }

  async Get<T>(): Promise<IHttpReturn<T>> {
    return await this.instance(this.requestConfig)
      .catch((e: AxiosError) => {
        throw new Error(e.message);
      })
      .then((response: AxiosResponse) => ({
        status: response.status,
        statusText: response.statusText,
        data: response.data.data ? response.data.data : response.data,
      }));
  }

  async Delete(): Promise<IHttpReturn<string>> {
    this.requestConfig.method = "DELETE";

    return await this.instance(this.requestConfig)
      .catch((e: AxiosError) => {
        throw new Error(e.message);
      })
      .then((response: AxiosResponse) => {
        return {
          status: response.status,
          statusText: response.statusText,
          data: response.data ? `${response.data}` : "",
        };
      });
  }

  async Patch<T>(data: object | string | Blob): Promise<IHttpReturn<T>> {
    this.requestConfig.method = "PATCH";
    this.requestConfig.data = data;

    return await this.instance(this.requestConfig)
      .catch((e: AxiosError) => {
        throw new Error(e.message);
      })
      .then((response: AxiosResponse) => {
        return {
          status: response.status,
          statusText: response.statusText,
          data: response.data || {},
        };
      });
  }

  async Post<T>(data: object | string | Blob): Promise<IHttpReturn<T>> {
    this.requestConfig.method = "POST";
    this.requestConfig.data = data;

    return await this.instance(this.requestConfig)
      .catch((e: AxiosError) => {
        throw new Error(e.message);
      })
      .then((response: AxiosResponse) => {
        return {
          status: response.status,
          statusText: response.statusText,
          data: response.data || {},
        };
      });
  }

  async Put<T>(data: object | string | Blob): Promise<IHttpReturn<T>> {
    this.requestConfig.method = "PUT";
    this.requestConfig.data = data;

    return await this.instance(this.requestConfig)
      .catch((e: AxiosError) => {
        throw new Error(e.message);
      })
      .then((response: AxiosResponse) => {
        return {
          status: response.status,
          statusText: response.statusText,
          data: response.data || {},
        };
      });
  }

  // if header authentication
  private SetHeader() {
    const headerName = (this.configFull.authentication as IHeaderConfig).header;
    const user = (this.configFull.authentication as IHeaderConfig).user;
    this.requestConfig.headers[headerName] = user;
  }

  // if JWT authentication
  private SetJWT() {
    const token = (this.configFull.authentication as IJWTConfig).token;
    this.requestConfig.headers["Authorization"] = `Bearer ${token}`;

    if ((this.configFull.authentication as ISaaSToken).webIntegrationId) {
      this.requestConfig.headers["qlik-web-integration-id"] = (
        this.configFull.authentication as ISaaSToken
      ).webIntegrationId;
    }
  }

  // if session authentication
  private SetSession() {
    const sessionId = (this.configFull.authentication as ISessionConfig)
      .sessionId;
    const cookieHeaderName = (this.configFull.authentication as ISessionConfig)
      .cookieHeaderName;
    this.requestConfig.headers["Cookie"] = `${cookieHeaderName}=${sessionId}`;
  }

  // set Qlik user header in the required format
  private SetUserHeader() {
    this.requestConfig.headers["X-Qlik-User"] = generateQlikUserHeader(
      this.configFull.authentication as ICertUser
    );
  }

  // set Qlik ticket
  private SetTicket() {
    const ticket: string = (this.configFull.authentication as ITicketConfig)
      .ticket;
    this.qlikTicket = ticket;
  }

  private async SaasPagingInterceptor(response: AxiosResponse) {
    let dataExtractComplete = false;
    let returnData: any = [];
    let resp = response;

    // SaaS returns an empty response with DELETE method
    if (response.data == "") return response;
    if (response.data == null) return response;
    if (!response.data) return undefined;

    if (response.data && response.data.data) returnData = response.data.data;
    if (response.data && !response.data.data) returnData = response.data;
    if (response.data && !response.data.links) return resp;

    while (dataExtractComplete == false) {
      if (!response.data) {
        dataExtractComplete = true;
      }

      if (
        resp.data &&
        resp.data.links &&
        (resp.data.links.next || resp.data.links.Next)
      ) {
        if (resp.data.links.next && resp.data.links.next.href == "") {
          dataExtractComplete = true;
          break;
        }
        if (resp.data.links.Next && resp.data.links.Next.Href == "") {
          dataExtractComplete = true;
          break;
        }

        if (resp.data.links.next.href == null) {
          dataExtractComplete = true;
          break;
        }

        let nextPageUrl = resp.data.links.next.href
          ? resp.data.links.next.href
          : resp.data.links.Next.Href;

        let nextPageConf = { ...resp.config };
        nextPageConf.url = nextPageUrl;
        await axios(nextPageConf).then((r: AxiosResponse) => {
          returnData = [...returnData, ...r.data.data];
          resp = r;
          dataExtractComplete =
            resp.data.links.next || resp.data.links.Next ? false : true;
        });
      } else {
        dataExtractComplete = true;
      }
    }

    if (!resp.data) {
      resp.data = {};
    }

    if (resp.data.links) {
      delete resp.data.links;
    }

    resp.data.data = returnData;

    return resp;
  }
}

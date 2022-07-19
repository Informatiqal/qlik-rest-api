import {
  IConfigFull,
  IHeaderConfig,
  IJWTConfig,
  ISessionConfig,
  ITicketConfig,
  IHttpReturn,
  ICertUser,
  ISaaSToken,
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

export class MakeRequest {
  configFull: IConfigFull;
  requestConfig: AxiosRequestConfig;
  xrfKey: string;
  qlikTicket: string;
  instance: AxiosInstance;
  private followLocation: boolean;
  private returnLocation: boolean;

  constructor(
    configFull: IConfigFull,
    followLocation?: boolean,
    returnLocation?: boolean
  ) {
    if (!configFull.host)
      throw new Error(`Missing "host" property or it is empty`);

    if (!configFull.authentication)
      throw new Error(`Missing "authentication" property or it is empty`);

    this.configFull = configFull;
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
        if (e.response)
          throw {
            status: e.response.status,
            statusText: e.response.statusText,
            message: e.message,
          };

        throw {
          status: undefined,
          statusText: undefined,
          message: e.message,
        };
      }
    );

    this.instance.interceptors.response.use(
      this.SaasPagingInterceptor,
      function (e: AxiosError) {
        throw e;
      }
      //   throw {
      //     status: e.response.status,
      //     statusText: e.response.statusText,
      //     message: e.message,
      //   };
      // }
    );

    this.SetHttpsAgent();
    this.SetHeader();
    this.SetJWT();
    this.SetSession();
    this.SetUserHeader();
    this.SetTicket();
    // this.SetAttributes();
    // this.SetContext();

    this.xrfKey = generateXrfkey();
  }

  PrepareRequestConfig(
    url: string,
    contentType = "application/json",
    responseType?: ResponseType,
    additionalHeaders?: { name: string; value: any }[]
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
  }

  async Get(): Promise<IHttpReturn> {
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

  async Delete(): Promise<IHttpReturn> {
    this.requestConfig.method = "DELETE";

    return await this.instance(this.requestConfig)
      .catch((e: AxiosError) => {
        throw new Error(e.message);
      })
      .then((response: AxiosResponse) => {
        return {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
        };
      });
  }

  async Patch(data: object | BinaryType | string | Blob): Promise<IHttpReturn> {
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
          data: response.data,
        };
      });
  }

  async Post(data: object | BinaryType | string | Blob): Promise<IHttpReturn> {
    this.requestConfig.method = "POST";
    this.requestConfig.data = data;

    return await this.instance(this.requestConfig).then(
      (response: AxiosResponse) => {
        return {
          status: response.status,
          statusText: response.statusText,
          data: response.data || {},
        };
      }
    );
  }

  async Put(data: object | BinaryType | string | Blob): Promise<IHttpReturn> {
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
          data: response.data,
        };
      });
  }

  private SetHttpsAgent() {
    if (this.configFull.httpsAgent)
      this.requestConfig.httpsAgent = this.configFull.httpsAgent;
  }

  private SetHeader() {
    // if header authentication
    if ((this.configFull.authentication as IHeaderConfig).header) {
      let headerName = (this.configFull.authentication as IHeaderConfig).header;
      let user = (this.configFull.authentication as IHeaderConfig).user;
      this.requestConfig.headers[headerName] = user;
    }
  }

  private SetJWT() {
    // if JWT authentication
    if ((this.configFull.authentication as IJWTConfig).token) {
      let token = (this.configFull.authentication as IJWTConfig).token;
      this.requestConfig.headers["Authorization"] = `Bearer ${token}`;
    }

    if ((this.configFull.authentication as ISaaSToken).webIntegrationId) {
      this.requestConfig.headers["qlik-web-integration-id"] = (
        this.configFull.authentication as ISaaSToken
      ).webIntegrationId;
    }
  }

  private SetSession() {
    // if session authentication
    if ((this.configFull.authentication as ISessionConfig).sessionId) {
      let sessionId = (this.configFull.authentication as ISessionConfig)
        .sessionId;
      let cookieHeaderName = (this.configFull.authentication as ISessionConfig)
        .cookieHeaderName;
      this.requestConfig.headers["Cookie"] = `${cookieHeaderName}=${sessionId}`;
    }
  }

  private SetUserHeader() {
    // set Qlik user header in the required format
    if ((this.configFull.authentication as any).user_name) {
      this.requestConfig.headers["X-Qlik-User"] = generateQlikUserHeader(
        this.configFull.authentication as ICertUser
      );
    }
  }

  private SetTicket() {
    // set Qlik ticket
    if ((this.configFull.authentication as ITicketConfig).ticket) {
      let ticket: string = (this.configFull.authentication as ITicketConfig)
        .ticket;
      this.qlikTicket = ticket;
    }
  }

  // private SetAttributes() {
  //   if (this.configFull.authentication.attributes) {
  //     if (!Array.isArray(this.configFull.authentication.attributes))
  //       throw new Error(`Provided connection attributes are not an array`);

  //     for (let attribute of this.configFull.authentication.attributes) {
  //       Object.entries(attribute).map(([key, value]) => {
  //         this.requestConfig.headers[key] = value;
  //       });
  //     }
  //   }
  // }

  // private SetContext() {
  //   if (this.configFull.context) {
  //     this.requestConfig.headers["Context"] = this.configFull.context;
  //   }
  // }

  private async SaasPagingInterceptor(response: AxiosResponse) {
    let dataExtractComplete = false;
    let returnData: any = [];
    let resp = response;

    // SaaS returns an empty response with DELETE method
    if (response.data == "") return response;

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

import {
  IConfigFull,
  IHeaderConfig,
  IJWTConfig,
  ISessionConfig,
  ITicketConfig,
  IHttpReturn,
  ICertUser,
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
            };
          }

          return response;
        }

        throw new Error(`Something wend wrong while processing the response`);
      },

      function (e: AxiosError) {
        throw {
          status: e.response.status,
          statusText: e.response.statusText,
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

    this.xrfKey = generateXrfkey();
    this.requestConfig.headers["X-Qlik-Xrfkey"] = this.xrfKey;
  }

  PrepareRequestConfig(
    url: string,
    contentType: string,
    responseType?: ResponseType,
    additionalHeaders?: { name: string; value: string | number }[]
  ): void {
    this.requestConfig.url = setQlikTicket(url, this.qlikTicket);
    this.requestConfig.url = setURLXrfKey(this.requestConfig.url, this.xrfKey);
    this.requestConfig.headers["Content-Type"] = contentType;
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
      .then((response: AxiosResponse) => {
        return {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
        };
      });
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

  async Patch(data: object): Promise<IHttpReturn> {
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

    return await this.instance(this.requestConfig)
      // .catch((e: AxiosError) => {
      //   throw new Error(e.message);
      // })
      .then((response: AxiosResponse) => {
        return {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
        };
      });
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

  private async SaasPagingInterceptor(response: AxiosResponse) {
    let dataExtractComplete = false;
    let returnData: any = [];
    let resp = response;

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
        let nextPageConf = { ...resp.config };
        nextPageConf.url = resp.data.links.next.href
          ? resp.data.links.next.href
          : resp.data.links.Next.Href;
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

    // delete resp.data.links;
    // resp.data.data = returnData;

    return resp;
  }
}

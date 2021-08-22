import { IConfig, IConfigFull, IHttpReturn } from "../interfaces/interfaces";
import { ResponseType } from "axios";
import { QlikClient } from "./BaseClient";

export class QlikSaaSClient extends QlikClient {
  constructor(config: IConfig) {
    const protocol = config.notSecure ? "http" : "https";

    const configFull: IConfigFull = {
      ...config,
      baseUrl: `${protocol}://${config.host}/api/v1`,
    };

    super(configFull);
  }

  Get(
    path: string,
    contentType = "application/json",
    responseType?: ResponseType
  ): Promise<IHttpReturn> {
    return super
      .Get(`${this.configFull.baseUrl}/${path}`, contentType, responseType)
      .then((r) => {
        return {
          data: r.data.data ? r.data.data : r.data,
          status: r.status,
          statusText: r.statusText,
        };
      });
  }

  Delete(
    path: string,
    contentType = "application/json",
    responseType?: ResponseType
  ) {
    return super.Delete(
      `${this.configFull.baseUrl}/${path}`,
      contentType,
      responseType
    );
  }

  Patch(
    path: string,
    data: object,
    contentType = "application/json",
    responseType?: ResponseType
  ): Promise<IHttpReturn> {
    return super.Post(
      `${this.configFull.baseUrl}/${path}`,
      data,
      contentType,
      responseType
    );
  }

  Post(
    path: string,
    data: object,
    contentType = "application/json",
    responseType?: ResponseType,
    followLocation?: boolean,
    returnLocation?: boolean,
    additionalHeaders?: { name: string; value: string }[]
  ): Promise<IHttpReturn> {
    return super.Post(
      `${this.configFull.baseUrl}/${path}`,
      data,
      contentType,
      responseType,
      followLocation,
      returnLocation,
      additionalHeaders
    );
  }

  Put(
    path: string,
    data: object,
    contentType = "application/json",
    responseType?: ResponseType
  ): Promise<IHttpReturn> {
    return super.Put(
      `${this.configFull.baseUrl}/${path}`,
      data,
      contentType,
      responseType
    );
  }
}

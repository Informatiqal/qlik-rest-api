import { IConfigFull, IHttpReturn } from "../interfaces/interfaces";
import { MakeRequest } from "../helpers/MakeRequest";
import { ResponseType } from "axios";

export abstract class QlikClient {
  configFull: IConfigFull;

  constructor(configFull: IConfigFull) {
    this.configFull = configFull;
  }

  async Get<T>(
    path: string,
    contentType?: string,
    responseType?: ResponseType
  ): Promise<IHttpReturn<T>> {
    const request = new MakeRequest(this.configFull);
    request.PrepareRequestConfig(
      `${this.configFull.baseUrl}/${path}`,
      contentType,
      responseType
    );
    return await request.Get<T>();
  }

  async Delete(
    path: string,
    contentType?: string,
    responseType?: ResponseType
  ): Promise<IHttpReturn<string>> {
    const request = new MakeRequest(this.configFull);
    request.PrepareRequestConfig(
      `${this.configFull.baseUrl}/${path}`,
      contentType,
      responseType
    );
    return await request.Delete();
  }

  async Patch<T>(
    path: string,
    data: object | BinaryType | string | Blob,
    contentType = "application/json",
    additionalHeaders?: { name: string; value: any }[],
    responseType?: ResponseType
  ): Promise<IHttpReturn<T>> {
    const request = new MakeRequest(this.configFull);
    request.PrepareRequestConfig(
      `${this.configFull.baseUrl}/${path}`,
      contentType,
      responseType,
      additionalHeaders || []
    );
    return await request.Patch(data);
  }

  async Post<T>(
    path: string,
    data: Object | BinaryType,
    contentType = "application/json",
    responseType?: ResponseType,
    followLocation?: boolean,
    returnLocation?: boolean,
    additionalHeaders?: { name: string; value: any }[]
  ): Promise<IHttpReturn<T>> {
    const request = new MakeRequest(
      this.configFull,
      followLocation,
      returnLocation
    );
    request.PrepareRequestConfig(
      `${this.configFull.baseUrl}/${path}`,
      contentType,
      responseType,
      additionalHeaders || []
    );
    return await request.Post(data);
  }

  async Put<T>(
    path: string,
    data: Object,
    contentType = "application/json",
    responseType?: ResponseType
  ): Promise<IHttpReturn<T>> {
    const request = new MakeRequest(this.configFull);
    request.PrepareRequestConfig(
      `${this.configFull.baseUrl}/${path}`,
      contentType,
      responseType
    );
    return await request.Put(data);
  }
}

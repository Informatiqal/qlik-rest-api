import { IConfigFull, IHttpReturn } from "../interfaces/interfaces";
import { MakeRequest } from "../helpers/MakeRequest";
import { ResponseType } from "axios";

export class QlikClient {
  configFull: IConfigFull;

  constructor(configFull: IConfigFull) {
    this.configFull = configFull;
  }

  async Get(
    url: string,
    contentType: string,
    responseType?: ResponseType
  ): Promise<IHttpReturn> {
    let request = new MakeRequest(this.configFull);
    request.PrepareRequestConfig(url, contentType, responseType);
    return await request.Get();
  }

  async Delete(
    url: string,
    contentType: string,
    responseType?: ResponseType
  ): Promise<IHttpReturn> {
    let request = new MakeRequest(this.configFull);
    request.PrepareRequestConfig(url, contentType, responseType);
    return await request.Delete();
  }

  async Patch(
    url: string,
    data: object | BinaryType | string | Blob,
    contentType = "application/json",
    responseType?: ResponseType
  ): Promise<IHttpReturn> {
    let request = new MakeRequest(this.configFull);
    request.PrepareRequestConfig(url, contentType, responseType);
    return await request.Post(data);
  }

  async Post(
    url: string,
    data: Object | BinaryType,
    contentType = "application/json",
    responseType?: ResponseType
  ): Promise<IHttpReturn> {
    let request = new MakeRequest(this.configFull);
    request.PrepareRequestConfig(url, contentType, responseType);
    return await request.Post(data);
  }

  async Put(
    url: string,
    data: Object,
    contentType = "application/json",
    responseType?: ResponseType
  ): Promise<IHttpReturn> {
    let request = new MakeRequest(this.configFull);
    request.PrepareRequestConfig(url, contentType, responseType);
    return await request.Put(data);
  }
}

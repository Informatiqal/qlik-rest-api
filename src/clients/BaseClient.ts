import {
  IConfigFull,
  IContext,
  IHttpReturn,
  IOauthTokenResponse,
  ISaaSErrorResponse,
  ISaaSOauthM2M,
} from "../interfaces/interfaces";
import { MakeRequest } from "../helpers/MakeRequest";
import axios, { AxiosError, ResponseType } from "axios";
import { ReadStream } from "fs";

export type Edition = "saas" | "win";

export abstract class QlikClient {
  configFull: IConfigFull;
  private edition: Edition;
  private tokenExpirationDate: Date;
  private context: IContext;

  constructor(configFull: IConfigFull, edition: Edition, context?: IContext) {
    this.configFull = configFull;
    this.edition = edition;
    this.context = context;
  }

  async Get<T>(
    path: string,
    contentType?: string,
    responseType?: ResponseType
  ): Promise<IHttpReturn<T>> {
    await this.SaaSTokenM2M();

    const request = new MakeRequest(this.configFull, this.edition);
    request.PrepareRequestConfig(
      `${this.configFull.baseUrl}/${path}`,
      contentType,
      responseType,
      undefined,
      this.context
    );
    return await request.Get<T>();
  }

  async Delete(
    path: string,
    contentType?: string,
    responseType?: ResponseType
  ): Promise<IHttpReturn<string>> {
    await this.SaaSTokenM2M();

    const request = new MakeRequest(this.configFull, this.edition);
    request.PrepareRequestConfig(
      `${this.configFull.baseUrl}/${path}`,
      contentType,
      responseType,
      undefined,
      this.context
    );
    return await request.Delete();
  }

  async Patch<T>(
    path: string,
    data: object | BinaryType | string | Blob | ReadStream,
    contentType = "application/json",
    additionalHeaders?: { name: string; value: any }[],
    responseType?: ResponseType
  ): Promise<IHttpReturn<T>> {
    await this.SaaSTokenM2M();

    const request = new MakeRequest(this.configFull, this.edition);
    request.PrepareRequestConfig(
      `${this.configFull.baseUrl}/${path}`,
      contentType,
      responseType,
      additionalHeaders || [],
      this.context
    );
    return await request.Patch(data);
  }

  async Post<T>(
    path: string,
    data: Object | BinaryType | ReadStream,
    contentType = "application/json",
    responseType?: ResponseType,
    followLocation?: boolean,
    returnLocation?: boolean,
    additionalHeaders?: { name: string; value: any }[]
  ): Promise<IHttpReturn<T>> {
    await this.SaaSTokenM2M();

    const request = new MakeRequest(
      this.configFull,
      this.edition,
      followLocation,
      returnLocation
    );
    request.PrepareRequestConfig(
      `${this.configFull.baseUrl}/${path}`,
      contentType,
      responseType,
      additionalHeaders || [],
      this.context
    );
    return await request.Post(data);
  }

  async Put<T>(
    path: string,
    data: Object,
    contentType = "application/json",
    responseType?: ResponseType
  ): Promise<IHttpReturn<T>> {
    await this.SaaSTokenM2M();

    const request = new MakeRequest(this.configFull, this.edition);
    request.PrepareRequestConfig(
      `${this.configFull.baseUrl}/${path}`,
      contentType,
      responseType,
      undefined,
      this.context
    );
    return await request.Put(data);
  }

  /**
   * Gets and sets the access token and token expiration date if the config
   * is set to have client_id and client_secret (SaaS only)
   */
  private async SaaSTokenM2M() {
    // if the config is not for SaaS or the SaaS authentication
    // is not with M2M Oauth
    if (
      !(this.configFull.authentication as ISaaSOauthM2M).clientId &&
      !(this.configFull.authentication as ISaaSOauthM2M).clientSecret
    )
      return;

    const { clientId, clientSecret } = this.configFull
      .authentication as ISaaSOauthM2M;
    const reqData = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    };

    // prepare the access token request
    const tokenRequest = async () => {
      return await axios
        .post(
          `https://${this.configFull.host}/oauth/token`,
          JSON.stringify(reqData),
          {
            headers: {
              "content-type": "application/json",
              accept: "application/json",
            },
          }
        )
        .then((res) => res.data as IOauthTokenResponse)
        .catch((e: AxiosError<{ errors: ISaaSErrorResponse[] }>) => {
          // if any meaningful response is returned
          // throw an error by combining all errors from the response
          if (e.response?.data?.errors) {
            throw new Error(
              `${e.message}: ${e.response.data.errors
                .map((e) => `${e.title} -> ${e.detail}`)
                .join("\n")}`
            );
          }

          throw new Error(e.stack);
        });
    };

    const now = new Date();

    // if access token is missing OR access token is expired
    // try and get new access token
    // once access token is obtained then re-write the config
    if (!this.tokenExpirationDate || this.tokenExpirationDate < now) {
      const tokenData = await tokenRequest();

      if (!tokenData) throw new Error("Token response is empty");

      if (!tokenData.expires_at && !tokenData.access_token)
        throw new Error(
          `"access_token" and "expires_at" are missing from the response`
        );

      this.tokenExpirationDate = new Date(tokenData.expires_at);

      this.configFull.authentication = {
        ...this.configFull.authentication,
        token: tokenData.access_token,
      };
    }
  }
}

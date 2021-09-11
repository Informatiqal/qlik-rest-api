import { IConfig, IConfigFull } from "../interfaces/interfaces";
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
}

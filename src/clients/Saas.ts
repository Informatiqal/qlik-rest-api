import { IConfig, IConfigFull } from "../interfaces/interfaces";
import { QlikClient } from "./BaseClient";

export class QlikSaaSClient extends QlikClient {
  constructor(config: IConfig) {
    const protocol = config.notSecure ? "http" : "https";
    const saasVersion = config.saasVersion ? config.saasVersion : 1;

    const configFull: IConfigFull = {
      ...config,
      baseUrl: `${protocol}://${config.host}/api/v${saasVersion}`,
    };

    super(configFull);
  }
}

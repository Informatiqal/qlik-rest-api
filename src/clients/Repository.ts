import { IConfig } from "../interfaces/interfaces";
import { QlikClient } from "./BaseClient";
import { urlComponents } from "../helpers/generic";

export class QlikRepositoryClient extends QlikClient {
  constructor(config: IConfig) {
    const { proxy, protocol, port } = urlComponents(config);

    super({
      ...config,
      baseUrl: `${protocol}://${config.host}${port}${proxy}/qrs`,
    });
  }
}

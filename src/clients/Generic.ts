import { IConfig, IConfigFull } from "../interfaces/interfaces";
import { QlikClient } from "./BaseClient";
import { urlComponents } from "../helpers/generic";

export class QlikGenericRestClient extends QlikClient {
  constructor(config: IConfig) {
    const { proxy, protocol, port } = urlComponents(config);
    if (!port) throw new Error(`"port" value is missing`);

    super(
      {
        ...config,
        baseUrl: `${protocol}://${config.host}${port}${proxy}`,
      },
      "win"
    );
  }
}

import { IConfig, IConfigFull } from "../interfaces/interfaces";
import { QlikClient } from "./BaseClient";
import { urlComponents } from "../helpers/generic";

export class QlikGenericRestClient extends QlikClient {
  constructor(config: IConfig, basePath?: string) {
    const { proxy, protocol, port } = urlComponents(config);
    if (!port) throw new Error(`"port" value is missing`);

    let baseUrl = `${protocol}://${config.host}${port}${proxy}`;
    if (basePath) baseUrl += `/${basePath}`;

    super(
      {
        ...config,
        baseUrl,
      },
      "win"
    );
  }
}

export class QlikFormData {
  private boundary: string;
  private streams: any[];
  private headers: string;
  private data: Buffer;
  constructor() {
    this.streams = [];
    this.generateBoundary();
    this.generateHeaders();
  }

  private generateBoundary(): void {
    // This generates a 50 character boundary similar to those used by Firefox.
    // They are optimized for boyer-moore parsing.
    let boundary = "--------------------------";
    for (let i = 0; i < 24; i++) {
      boundary += Math.floor(Math.random() * 10).toString(16);
    }

    this.boundary = boundary;
  }

  private generateHeaders(): void {
    this.headers = "multipart/form-data; boundary=" + this.boundary;
  }

  /**
   *  Return the generated data
   */
  get getData(): Buffer {
    return this.data;
  }

  /**
   *  Return the generated headers
   */
  get getHeaders(): string {
    return this.headers;
  }

  append(
    arg:
      | {
          /**
           * Name of the field
           */
          field: string;
          /**
           * The actual data that is being uploaded
           */
          data: any;
          contentType?: undefined;
          fileName?: undefined;
        }
      | {
          field: string;
          data: any;
          /**
           * The content type (mime) of the file being uploaded. For example:
           *
           * - application/x-zip-compressed
           * - image/png
           * - image/jpeg
           * - image/x-icon
           * - text/css
           */
          contentType: string;
          /**
           * Name of the file that is being uploaded
           */
          fileName?: string;
        },
  ) {
    if (!arg) throw new Error(`FormData: arguments are missing`);
    if (!arg.data) throw new Error(`FormData: "data" parameter is missing`);
    if (!arg.field) throw new Error(`FormData: "field" parameter is missing`);
    if (arg.fileName && !arg.contentType)
      throw new Error(`FormData: content type (mime) is missing`);

    // remove the last entry if appending more than one
    this.streams.pop();

    let extras = `name="${arg.field}";`;
    if (arg.fileName) extras += ` filename="${arg.fileName}"`;
    if (arg.contentType) extras += `\r\nContent-Type: ${arg.contentType}`;

    this.streams.push(
      `--${this.boundary}\r\nContent-Disposition: form-data; ${extras}\r\n\r\n`,
    );

    this.streams.push(arg.data);

    this.data = this.getFormData();
  }

  private getFormData(): Buffer {
    this.streams.push(`--${this.boundary}--\r\n`);

    var dataBuffer = Buffer.alloc(0);

    // Create the form content. Add Line breaks to the end of data.
    for (var i = 0, len = this.streams.length; i < len; i++) {
      if (Buffer.isBuffer(this.streams[i])) {
        dataBuffer = Buffer.concat([dataBuffer, this.streams[i]]);
      } else {
        dataBuffer = Buffer.concat([dataBuffer, Buffer.from(this.streams[i])]);
      }

      // Add break after content.
      if (
        typeof this.streams[i] !== "string" ||
        this.streams[i].substring(2, this.boundary.length + 2) !== this.boundary
      ) {
        dataBuffer = Buffer.concat([dataBuffer, Buffer.from("\r\n")]);
      }
    }
    return dataBuffer;
  }

  /**
   * Clear the data
   */
  clear(): void {
    this.streams = [];
  }
}

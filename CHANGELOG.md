# Changelog

All notable changes to this project will be documented in this file.

## 1.8.6 - 2025-06-13

- dependency updates
- small updates to SaaS tests

## 1.8.5 - 2025-06-11

- dependency updates

## 1.8.4 - 2024-08-22

- dependency updates

## 1.8.3 - 2023-11-23

- dependency updates

## 1.8.2 - 2023-08-24

- [#218](https://github.com/Informatiqal/qlik-rest-api/issues/218) allow passing additional config options. At the moment the only needed option is `swapResourceIdAndId` for SaaS `apps` entity. If needed more options can be added in the future. This is just a type change and no core code changes were made.
- dependency updates

## 1.8.1 - 2023-08-21

- [#216](https://github.com/Informatiqal/qlik-rest-api/issues/216) correctly return all pages data instead of only data from the last page

## 1.8.0 - 2023-08-12

- SaaS errors will now include the SaaS errors description from the response (if any)
- `QlikFormData` is now exported
- ability to provide content type/mime when using `QlikFormData` module
- tests are `vitest` based (`mocha` and `chai` are not used anymore)

## 1.7.6 - 2023-06-06

- `Post` and `Path` methods "accept" `ReadStream` alongside with `Buffer`

## 1.7.5 - 2023-05-03

- `QlikGenericRestClient` accepts optional `basePath` parameter [#172](https://github.com/Informatiqal/qlik-rest-api/issues/172)

## 1.7.4 - 2023-04-25

- throw error when port is not provided in the config for GenericRestClient
- dependency updates

## 1.7.2 - 2023-01-29

- fixed issue when data is returned under `data.data` property instead of `data`

## 1.7.1 - 2023-01-27

- sometimes the SaaS requests will be returned with data object being repeated over and over again

## 1.7.0 - 2023-01-13

- optional context parameter for Repository client - `hub` or `qmc`. By default the calls will be made as if the user is accessing the data from QMC. If `hub` is specified then the point of view will be the Hub. The context is passed to Qlik and is used in security rules application

## 1.6.1 - 2022-12-27

- all dependencies are up-to-date

## 1.6.0 - 2022-12-05

- Qlik SaaS OAuth authentication (machine-to-machine) workflow - authenticate with `client_id` and `client_secret` [#102](https://github.com/Informatiqal/qlik-rest-api/issues/102)

## 1.5.0 - 2022-10-19

- internal - do not include SaaS specific response codebase when calling QSEoW (and vice-versa) [#95](https://github.com/Informatiqal/qlik-rest-api/issues/95)

## 1.4.4 - 2022-10-19

- [add] error will be thrown if the response is with status 429 (rate limit reached). Ideally only applicable only to SaaS

## 1.4.3 - 2022-10-18

- [fix] for some requests Qlik returns `null` but the request status was success. This was threated as an empty data response and `undefined` was returned. Now if the data is `null` then the original response will be returned.

## 1.4.2 - 2022-10-17

- [fix] `POST` request returns the raw http error (if any)

## 1.4.1 - 2022-09-20

- [change] Allow configuration to be created without `authentication` property [#83](https://github.com/Informatiqal/qlik-rest-api/issues/83)

## 1.4.0 - 2022-09-20

- For TS usage each method will require return type to be specified. The type will be passed to `IHttpReturn` type and then will be used for the returned `data` property [#81](https://github.com/Informatiqal/qlik-rest-api/issues/81)

## 1.3.9 - 2022-07-28

- [fix] Return the response `data` object (if exists) in case of an error. Until now the thrown error object only contained the basic info - `status` and `message`. More info in [#67](https://github.com/Informatiqal/qlik-rest-api/issues/67)

## 1.3.8 - 2022-07-19

- [fix] `SaaS` - for some requests `next` parameter is `null`

## 1.3.7 - 2022-05-15

- [fix] dependency updates

## 1.3.6 - 2022-03-20

- [fix] dependency updates

## 1.3.5 - 2022-03-11

- [fix] when request is failing even before its send then throw the actual error message. For example: self-signed certificates. The request was failing before response is received and the error was about the response object missing. Now if response is missing the thrown error will have `status` and `statusText` as `undefined` and `message` will be the actual error message. In the self-signed cert example the message will be `unable to verify the first certificate`

## 1.3.4 - 2022-02-07

- [fix] probably wrong build was pushed?

## 1.3.3 - 2022-02-07

- [fix] failing when the response is `null` [#11](https://github.com/Informatiqal/qlik-rest-api/issues/11)

## 1.3.2 - 2021-11-15

### Changed

- dependencies updates
- `additionalHeaders` config option changed to accept `any` for `value`
-

## 1.3.1 - 2021-11-01

### Added

- additional checks
  - `host` property exists in the config
  - `authentication` property exists in the config

## 1.3.0 - 2021-10-25

- [fix] SaaS client correctly returns all items (if pagination is available) [#8](https://github.com/Informatiqal/qlik-rest-api/issues/8)
- [fix] SaaS client handle empty next page urls (issue on Qlik side?)
- [fix] do not execute pagination logic if the response ok but is empty
- [fix] `Patch` method is executed correctly [#9](https://github.com/Informatiqal/qlik-rest-api/issues/9)
- [change] documentation is using dark theme
- [add] SaaS config accepts api version (optional). Defaults to `1` [#7](https://github.com/Informatiqal/qlik-rest-api/issues/7)
- [add] `QlikFormData` is exposed and can be used to pass `FormData` parameters (SaaS only probably) [#6](https://github.com/Informatiqal/qlik-rest-api/issues/6)
- [add] more tests for SaaS

## 1.2.0 - 2021-09-11

- [change] `BaseClient` is now an `abstract` class
- [change] all clients that extends `BaseClient` no longer implements the http methods (these are inherited from `BaseClient`)

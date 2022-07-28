# Changelog

All notable changes to this project will be documented in this file.

## [1.3.9] - 2022-07-28

### Fix

- Return the response `data` object (if exists) in case of an error. Until now the thrown error object only contained the basic info - `status` and `message`. More info in [#67](https://github.com/Informatiqal/qlik-rest-api/issues/67)

## [1.3.8] - 2022-07-19

### Fix

- `SaaS` - for some requests `next` parameter is `null`

## [1.3.7] - 2022-05-15

### Fix

- dependency updates

## [1.3.6] - 2022-03-20

### Fix

- dependency updates

## [1.3.5] - 2022-03-11

### Fix

- when request is failing even before its send then throw the actual error message. For example: self-signed certificates. The request was failing before response is received and the error was about the response object missing. Now if response is missing the thrown error will have `status` and `statusText` as `undefined` and `message` will be the actual error message. In the self-signed cert example the message will be `unable to verify the first certificate`

## [1.3.4] - 2022-02-07

### Fix

- probably wrong build was pushed?

## [1.3.3] - 2022-02-07

### Fix

- failing when the response is `null` [#11](https://github.com/Informatiqal/qlik-rest-api/issues/11)

## [1.3.2] - 2021-11-15

### Changed

- dependencies updates
- `additionalHeaders` config option changed to accept `any` for `value`
-

## [1.3.1] - 2021-11-01

### Added

- additional checks
  - `host` property exists in the config
  - `authentication` property exists in the config

## [1.3.0] - 2021-10-25

### Fix

- SaaS client correctly returns all items (if pagination is available) [#8](https://github.com/Informatiqal/qlik-rest-api/issues/8)
- SaaS client handle empty next page urls (issue on Qlik side?)
- do not execute pagination logic if the response ok but is empty
- `Patch` method is executed correctly [#9](https://github.com/Informatiqal/qlik-rest-api/issues/9)

### Changed

- documentation is using dark theme

### Added

- SaaS config accepts api version (optional). Defaults to `1` [#7](https://github.com/Informatiqal/qlik-rest-api/issues/7)
- `QlikFormData` is exposed and can be used to pass `FormData` parameters (SaaS only probably) [#6](https://github.com/Informatiqal/qlik-rest-api/issues/6)
- more tests for SaaS

## [1.2.0] - 2021-09-11

### Changed

- `BaseClient` is now an `abstract` class
- all clients that extends `BaseClient` no longer implements the http methods (these are inherited from `BaseClient`)

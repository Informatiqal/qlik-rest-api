# Changelog

All notable changes to this project will be documented in this file.

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

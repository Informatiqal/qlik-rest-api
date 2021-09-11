# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2021-09-XX

### Changed

- `BaseClient` is now an `abstract` class
- all clients that extends `BaseClient` no longer implements the http methods (these are inherited from `BaseClient`)

# Changelog

## Unreleased
### Changed
- **BREAKING**: Duplicate key checking in strict mode now only validates within the same file, not across files
  - This allows file precedence to work correctly even in strict mode
  - Cross-file overrides are now supported in both strict and non-strict modes
  - Only duplicate keys within the same file will trigger errors in strict mode

### Added
- `debug` option to log file precedence overrides to console
  - Shows which files override values and the before/after values
  - Useful for understanding configuration cascading behavior

## 0.2.0 - 2026-02-02
### Changed
- Rename `export` option to `exportEnv` (no alias).
- Attach parsed values to `process.menv` by default (disable with `attach: false`).

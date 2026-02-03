molex-env

Native .menv loader with profiles, typing, origin tracking, and optional reload.

Highlights
- Deterministic profile merging
- Typed parsing (boolean, number, json, date)
- Strict mode for unknown or duplicate keys
- Origin tracking (file + line)
- Immutable config objects
- Optional file watching for reload

Install
- npm install molex-env

Basic usage
const { load } = require('molex-env');

const result = load({
  profile: 'prod',
  export: true,
  strict: true,
  schema: {
    PORT: 'number',
    DEBUG: 'boolean',
    SERVICE_URL: { type: 'string', required: true }
  }
});

console.log(result.parsed.PORT);
console.log(result.origins.SERVICE_URL);

File precedence
1) .menv
2) .menv.local
3) .menv.{profile}
4) .menv.{profile}.local

API
load(options)
- cwd: base directory (default: process.cwd())
- profile: profile name for .menv.{profile}
- files: custom file list (absolute or relative to cwd)
- schema: allowed keys, types, defaults, required
- strict: reject unknown keys, duplicates, and invalid lines
- cast: true | false | { boolean, number, json, date }
- export: write values to process.env
- override: override existing process.env values
- freeze: deep-freeze parsed config (default true)
- onWarning: function(info) for non-strict duplicates

parse(text, options)
- Parse a string of .menv content using the same typing rules

watch(options, onChange)
- Watch resolved files and reload on change
- onChange(err, result)

Schema example
const schema = {
  PORT: { type: 'number', default: 3000 },
  DEBUG: { type: 'boolean', default: false },
  METADATA: { type: 'json' },
  START_DATE: { type: 'date' }
};

Notes
- Use .menv.local for machine-specific values
- Use strict mode to detect surprises early

Example project
An example app is included in examples/basic.
Run it with:
- npm install (from examples/basic)
- npm start

'use strict';

const path = require('path');
const { load } = require('molex-env');

const result = load({
  cwd: __dirname,
  profile: 'dev',
  strict: true,
  schema: {
    PORT: { type: 'number', default: 3000 },
    DEBUG: { type: 'boolean', default: false },
    SERVICE_URL: { type: 'string', required: true },
    START_DATE: { type: 'date' },
    META: { type: 'json' }
  }
});

console.log('Parsed config:', result.parsed);
console.log('Origin for SERVICE_URL:', result.origins.SERVICE_URL);
console.log('process.menv.PORT:', process.menv.PORT);
console.log('Example path:', path.join(__dirname, '.menv'));

try {
  load({
    cwd: __dirname,
    files: ['.menv.dup'],
    strict: true
  });
  console.log('Duplicate test: unexpected success');
} catch (err) {
  console.log('Duplicate test: expected error:', err.message);
}

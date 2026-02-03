'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { parse } = require('../src');

test('parse casts values and tracks origin', () =>
{
    const input = [
        'PORT=3000',
        'DEBUG=true',
        'DATA={"a":1}',
        'START=2026-02-02',
        'NAME="Hello"'
    ].join('\n');

    const result = parse(input, { strict: true });

    assert.strictEqual(result.parsed.PORT, 3000);
    assert.strictEqual(result.parsed.DEBUG, true);
    assert.deepStrictEqual(result.parsed.DATA, { a: 1 });
    assert.ok(result.parsed.START instanceof Date);
    assert.strictEqual(result.parsed.NAME, 'Hello');
    assert.strictEqual(result.origins.PORT.line, 1);
});

test('parse enforces schema and defaults', () =>
{
    const input = 'PORT=3000\nDEBUG=false';
    const schema = {
        PORT: { type: 'number' },
        DEBUG: { type: 'boolean' },
        NAME: { type: 'string', default: 'app' }
    };

    const result = parse(input, { schema, strict: true });

    assert.strictEqual(result.parsed.NAME, 'app');
});

test('parse rejects invalid lines in strict mode', () =>
{
    const input = 'PORT=3000\nINVALID LINE';

    assert.throws(() => parse(input, { strict: true }));
});

test('parse rejects invalid typed values', () =>
{
    const input = 'PORT=abc';
    const schema = {
        PORT: { type: 'number' }
    };

    assert.throws(() => parse(input, { strict: true, schema }));
});

test('parse preserves strings when cast is false', () =>
{
    const input = 'DEBUG=false\nPORT=3000';

    const result = parse(input, { cast: false });

    assert.strictEqual(result.parsed.DEBUG, 'false');
    assert.strictEqual(result.parsed.PORT, '3000');
});

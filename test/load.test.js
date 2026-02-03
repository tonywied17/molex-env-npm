'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { load } = require('../src');

function makeTempDir()
{
    return fs.mkdtempSync(path.join(os.tmpdir(), 'menv-'));
}

test('load merges files by precedence', () =>
{
    const dir = makeTempDir();
    fs.writeFileSync(path.join(dir, '.menv'), 'PORT=3000\nDEBUG=false');
    fs.writeFileSync(path.join(dir, '.menv.local'), 'DEBUG=true');
    fs.writeFileSync(path.join(dir, '.menv.prod'), 'PORT=9000');

    const result = load({ cwd: dir, profile: 'prod' });

    assert.strictEqual(result.parsed.PORT, 9000);
    assert.strictEqual(result.parsed.DEBUG, true);
});

test('load rejects unknown keys in strict mode', () =>
{
    const dir = makeTempDir();
    fs.writeFileSync(path.join(dir, '.menv'), 'PORT=3000\nEXTRA=1');

    assert.throws(() => load({
        cwd: dir,
        strict: true,
        schema: {
            PORT: { type: 'number' }
        }
    }));
});

test('load rejects duplicates in strict mode', () =>
{
    const dir = makeTempDir();
    fs.writeFileSync(path.join(dir, '.menv'), 'PORT=3000\nPORT=3001');

    assert.throws(() => load({ cwd: dir, strict: true }));
});

test('load enforces required schema keys', () =>
{
    const dir = makeTempDir();
    fs.writeFileSync(path.join(dir, '.menv'), 'PORT=3000');

    assert.throws(() => load({
        cwd: dir,
        strict: true,
        schema: {
            PORT: { type: 'number' },
            SERVICE_URL: { type: 'string', required: true }
        }
    }));
});

test('load exports to process.env with override option', () =>
{
    const dir = makeTempDir();
    fs.writeFileSync(path.join(dir, '.menv'), 'PORT=3000');

    const original = process.env.PORT;
    process.env.PORT = '1111';

    try
    {
        load({ cwd: dir, export: true, override: false });
        assert.strictEqual(process.env.PORT, '1111');

        load({ cwd: dir, export: true, override: true });
        assert.strictEqual(process.env.PORT, '3000');
    } finally
    {
        if (original === undefined)
        {
            delete process.env.PORT;
        } else
        {
            process.env.PORT = original;
        }
    }
});

test('load respects explicit files option', () =>
{
    const dir = makeTempDir();
    fs.writeFileSync(path.join(dir, '.menv'), 'PORT=3000');
    fs.writeFileSync(path.join(dir, '.menv.prod'), 'PORT=9000');
    fs.writeFileSync(path.join(dir, '.menv.custom'), 'PORT=7000');

    const result = load({
        cwd: dir,
        profile: 'prod',
        files: ['.menv.custom']
    });

    assert.strictEqual(result.parsed.PORT, 7000);
});

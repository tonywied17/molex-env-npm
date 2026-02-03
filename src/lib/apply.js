'use strict';

const { unknownKeyError, duplicateKeyError } = require('./errors');
const { coerceType, autoCast } = require('./cast');

/**
 * Apply a parsed entry to the state with schema/type checks.
 * @param {{values: object, origins: object, seen: Set<string>}} state
 * @param {{key: string, raw: string, line: number}} entry
 * @param {{schema: object|null, strict: boolean, cast: object, onWarning?: Function}} options
 * @param {string} filePath
 * @returns {void}
 */
function applyEntry(state, entry, options, filePath)
{
    const { schema, strict, cast, onWarning } = options;
    const { key, raw, line } = entry;

    if (schema && strict && !schema[key])
    {
        throw unknownKeyError(key, filePath, line);
    }

    if (state.seen.has(key))
    {
        if (strict)
        {
            throw duplicateKeyError(key, filePath, line);
        }
        if (typeof onWarning === 'function')
        {
            onWarning({
                type: 'duplicate',
                key,
                file: filePath,
                line
            });
        }
    }

    const def = schema ? schema[key] : null;
    let value;
    if (def && def.type)
    {
        value = coerceType(raw, def.type, filePath, line);
    } else
    {
        value = autoCast(raw, cast);
    }

    state.values[key] = value;
    state.origins[key] = { file: filePath, line, raw };
    state.seen.add(key);
}

module.exports = {
    applyEntry
};

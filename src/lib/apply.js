'use strict';

const { unknownKeyError, duplicateKeyError } = require('./errors');
const { coerceType, autoCast } = require('./cast');

/**
 * Apply a parsed entry to the state with schema/type checks.
 * @param {{values: object, origins: object, seenPerFile: Map<string, Set<string>>}} state
 * @param {{key: string, raw: string, line: number}} entry
 * @param {{schema: object|null, strict: boolean, cast: object, onWarning?: Function, debug?: boolean}} options
 * @param {string} filePath
 * @returns {void}
 */
function applyEntry(state, entry, options, filePath)
{
    const { schema, strict, cast, onWarning, debug } = options;
    const { key, raw, line } = entry;

    if (schema && strict && !schema[key])
    {
        throw unknownKeyError(key, filePath, line);
    }

    // Initialize per-file tracking if needed
    if (!state.seenPerFile.has(filePath))
    {
        state.seenPerFile.set(filePath, new Set());
    }
    const fileKeys = state.seenPerFile.get(filePath);

    // Check for duplicates ONLY within the same file
    if (fileKeys.has(key))
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

    // Debug logging for file precedence
    if (debug && state.values[key] !== undefined)
    {
        const prevOrigin = state.origins[key];
        console.log(`[molex-env] Override: ${key}`);
        console.log(`  Previous: ${prevOrigin.file}:${prevOrigin.line} = ${prevOrigin.raw}`);
        console.log(`  New:      ${filePath}:${line} = ${raw}`);
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
    fileKeys.add(key);
}

module.exports = {
    applyEntry
};

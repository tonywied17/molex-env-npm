'use strict';

const { missingRequiredError } = require('./errors');

/**
 * Normalize schema definitions into objects.
 * @param {object} schema
 * @returns {object|null}
 */
function normalizeSchema(schema)
{
    if (!schema) return null;
    const normalized = {};
    for (const key of Object.keys(schema))
    {
        const def = schema[key];
        if (typeof def === 'string')
        {
            normalized[key] = { type: def };
        } else if (def && typeof def === 'object')
        {
            normalized[key] = { ...def };
        }
    }
    return normalized;
}

/**
 * Apply defaults and required checks from schema.
 * @param {object} values
 * @param {object} origins
 * @param {object|null} schema
 * @param {boolean} strict
 * @returns {void}
 */
function applySchemaDefaults(values, origins, schema, strict)
{
    if (!schema) return;
    for (const key of Object.keys(schema))
    {
        const def = schema[key];
        if (values[key] === undefined)
        {
            if (def && Object.prototype.hasOwnProperty.call(def, 'default'))
            {
                values[key] = def.default;
                origins[key] = { file: '<default>', line: 0, raw: undefined };
            } else if (strict && def && def.required)
            {
                throw missingRequiredError(key);
            }
        }
    }
}

module.exports = {
    normalizeSchema,
    applySchemaDefaults
};

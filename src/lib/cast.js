'use strict';

const { invalidTypeError } = require('./errors');

/**
 * Normalize cast options into explicit booleans.
 * @param {boolean|{boolean?: boolean, number?: boolean, json?: boolean, date?: boolean}} cast
 * @returns {{boolean: boolean, number: boolean, json: boolean, date: boolean}}
 */
function normalizeCast(cast)
{
    if (cast === true || cast === undefined)
    {
        return { boolean: true, number: true, json: true, date: true };
    }
    if (cast === false)
    {
        return { boolean: false, number: false, json: false, date: false };
    }
    return {
        boolean: cast.boolean !== false,
        number: cast.number !== false,
        json: cast.json !== false,
        date: cast.date !== false
    };
}

/**
 * Check if a string is a number.
 * @param {string} value
 * @returns {boolean}
 */
function isNumber(value)
{
    return /^-?\d+(\.\d+)?$/.test(value);
}

/**
 * Check if a string looks like an ISO date.
 * @param {string} value
 * @returns {boolean}
 */
function isIsoDate(value)
{
    return /^\d{4}-\d{2}-\d{2}(?:[T\s].*)?$/.test(value);
}

/**
 * Coerce a raw string to the requested type.
 * @param {string} raw
 * @param {string} type
 * @param {string} file
 * @param {number} line
 * @returns {any}
 */
function coerceType(raw, type, file, line)
{
    if (type === 'string') return raw;
    if (type === 'boolean')
    {
        if (raw.toLowerCase() === 'true') return true;
        if (raw.toLowerCase() === 'false') return false;
        throw invalidTypeError('boolean', raw, file, line);
    }
    if (type === 'number')
    {
        if (!isNumber(raw)) throw invalidTypeError('number', raw, file, line);
        return Number(raw);
    }
    if (type === 'json')
    {
        return JSON.parse(raw);
    }
    if (type === 'date')
    {
        const date = new Date(raw);
        if (Number.isNaN(date.getTime())) throw invalidTypeError('date', raw, file, line);
        return date;
    }
    return raw;
}

/**
 * Auto-cast a raw string based on enabled rules.
 * @param {string} raw
 * @param {{boolean: boolean, number: boolean, json: boolean, date: boolean}} cast
 * @returns {any}
 */
function autoCast(raw, cast)
{
    const trimmed = raw.trim();
    if (cast.boolean)
    {
        const lower = trimmed.toLowerCase();
        if (lower === 'true') return true;
        if (lower === 'false') return false;
    }
    if (cast.number && isNumber(trimmed))
    {
        return Number(trimmed);
    }
    if (cast.json && (trimmed.startsWith('{') || trimmed.startsWith('[')))
    {
        try
        {
            return JSON.parse(trimmed);
        } catch (err)
        {
            return trimmed;
        }
    }
    if (cast.date && isIsoDate(trimmed))
    {
        const date = new Date(trimmed);
        if (!Number.isNaN(date.getTime())) return date;
    }
    return trimmed;
}

module.exports = {
    normalizeCast,
    coerceType,
    autoCast
};

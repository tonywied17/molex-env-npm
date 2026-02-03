'use strict';

/**
 * Base error type for molex-env.
 */
class MenvError extends Error
{
    constructor(message, details)
    {
        super(message);
        this.name = 'MenvError';
        if (details)
        {
            this.details = details;
        }
    }
}

/**
 * Format a file/line suffix for error messages.
 * @param {string} file
 * @param {number} line
 * @returns {string}
 */
function formatLocation(file, line)
{
    if (!file) return '';
    if (!line) return ` (${file})`;
    return ` (${file}:${line})`;
}

/**
 * Create an invalid line error.
 * @param {number} line
 * @param {string} rawLine
 * @param {string} file
 * @returns {MenvError}
 */
function invalidLineError(line, rawLine, file)
{
    return new MenvError(`Invalid line ${line}: ${rawLine}${formatLocation(file)}`);
}

/**
 * Create an unknown key error.
 * @param {string} key
 * @param {string} file
 * @param {number} line
 * @returns {MenvError}
 */
function unknownKeyError(key, file, line)
{
    return new MenvError(`Unknown key: ${key}${formatLocation(file, line)}`);
}

/**
 * Create a duplicate key error.
 * @param {string} key
 * @param {string} file
 * @param {number} line
 * @returns {MenvError}
 */
function duplicateKeyError(key, file, line)
{
    return new MenvError(`Duplicate key: ${key}${formatLocation(file, line)}`);
}

/**
 * Create a missing required key error.
 * @param {string} key
 * @returns {MenvError}
 */
function missingRequiredError(key)
{
    return new MenvError(`Missing required key: ${key}`);
}

/**
 * Create an invalid type error.
 * @param {string} type
 * @param {string} raw
 * @param {string} file
 * @param {number} line
 * @returns {MenvError}
 */
function invalidTypeError(type, raw, file, line)
{
    return new MenvError(`Invalid ${type}: ${raw}${formatLocation(file, line)}`);
}

module.exports = {
    MenvError,
    invalidLineError,
    unknownKeyError,
    duplicateKeyError,
    missingRequiredError,
    invalidTypeError
};

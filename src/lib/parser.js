'use strict';

const { invalidLineError } = require('./errors');

/**
 * Strip inline comments while preserving quoted values.
 * @param {string} line
 * @returns {string}
 */
function stripInlineComment(line)
{
    let inSingle = false;
    let inDouble = false;
    let escaped = false;
    for (let i = 0; i < line.length; i += 1)
    {
        const ch = line[i];
        if (escaped)
        {
            escaped = false;
            continue;
        }
        if (ch === '\\')
        {
            escaped = true;
            continue;
        }
        if (ch === '"' && !inSingle)
        {
            inDouble = !inDouble;
            continue;
        }
        if (ch === "'" && !inDouble)
        {
            inSingle = !inSingle;
            continue;
        }
        if (ch === '#' && !inSingle && !inDouble)
        {
            return line.slice(0, i);
        }
    }
    return line;
}

/**
 * Remove wrapping quotes and unescape common sequences.
 * @param {string} value
 * @returns {string}
 */
function stripQuotes(value)
{
    const trimmed = value.trim();
    if (trimmed.length >= 2)
    {
        const first = trimmed[0];
        const last = trimmed[trimmed.length - 1];
        if ((first === '"' && last === '"') || (first === "'" && last === "'"))
        {
            return trimmed
                .slice(1, -1)
                .replace(/\\n/g, '\n')
                .replace(/\\r/g, '\r')
                .replace(/\\t/g, '\t')
                .replace(/\\\\/g, '\\');
        }
    }
    return trimmed;
}

/**
 * Parse raw text into key/value entries.
 * @param {string} text
 * @param {{strict?: boolean, filePath?: string}} options
 * @returns {{key: string, raw: string, line: number}[]}
 */
function parseEntries(text, options)
{
    const strict = Boolean(options.strict);
    const filePath = options.filePath;
    const lines = text.split(/\r?\n/);
    const entries = [];

    for (let i = 0; i < lines.length; i += 1)
    {
        const rawLine = lines[i];
        const cleaned = stripInlineComment(rawLine);
        if (!cleaned.trim()) continue;

        const match = cleaned.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
        if (!match)
        {
            if (strict)
            {
                throw invalidLineError(i + 1, rawLine, filePath);
            }
            continue;
        }

        const key = match[1];
        const rawValue = stripQuotes(match[2] || '');

        entries.push({
            key,
            raw: rawValue,
            line: i + 1
        });
    }

    return entries;
}

module.exports = {
    parseEntries
};

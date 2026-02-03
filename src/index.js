'use strict';

const { load, parse } = require('./lib/core');
const { watch } = require('./lib/watch');

function loadEntry(options)
{
    return load(options);
}

/**
 * Watch resolved .menv files and reload on change.
 * @param {object} options
 * @param {(err: Error|null, result?: {parsed: object, origins: object, files: string[]}) => void} onChange
 * @returns {{close: () => void}}
 */
function watchEntry(options, onChange)
{
    return watch(options, onChange, loadEntry);
}

module.exports = Object.assign(loadEntry, {
    load: loadEntry,
    parse,
    watch: watchEntry
});

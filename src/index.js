'use strict';

const { load, parse } = require('./lib/core');
const { watch } = require('./lib/watch');

module.exports = {
    load,
    parse,
    /**
     * Watch resolved .menv files and reload on change.
     * @param {object} options
     * @param {(err: Error|null, result?: {parsed: object, origins: object, files: string[]}) => void} onChange
     * @returns {{close: () => void}}
     */
    watch(options, onChange)
    {
        return watch(options, onChange, load);
    }
};

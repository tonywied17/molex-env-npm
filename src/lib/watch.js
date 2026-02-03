'use strict';

const fs = require('fs');
const path = require('path');
const { resolveFiles } = require('./files');

/**
 * Watch resolved files and reload on changes.
 * @param {object} options
 * @param {(err: Error|null, result?: {parsed: object, origins: object, files: string[]}) => void} onChange
 * @param {(options: object) => {parsed: object, origins: object, files: string[]}} load
 * @returns {{close: () => void}}
 */
function watch(options, onChange, load)
{
    if (typeof onChange !== 'function')
    {
        throw new Error('onChange callback is required');
    }
    if (typeof load !== 'function')
    {
        throw new Error('load function is required');
    }

    const files = resolveFiles(options);
    const cwd = options.cwd || process.cwd();
    const basenames = new Set(files.map((file) => path.basename(file)));
    const watchers = [];
    let timer = null;

    const trigger = () =>
    {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() =>
        {
            try
            {
                const result = load(options);
                onChange(null, result);
            } catch (err)
            {
                onChange(err);
            }
        }, 50);
    };

    for (const filePath of files)
    {
        if (!fs.existsSync(filePath)) continue;
        watchers.push(fs.watch(filePath, trigger));
    }

    if (options.watchMissing !== false)
    {
        watchers.push(fs.watch(cwd, (event, filename) =>
        {
            if (!filename) return;
            if (basenames.has(filename))
            {
                trigger();
            }
        }));
    }

    return {
        close()
        {
            watchers.forEach((watcher) => watcher.close());
            watchers.length = 0;
        }
    };
}

module.exports = {
    watch
};

import fs from 'node:fs';
import path from 'node:path';
import test from 'tape';
import yamlvalidator from 'yaml-validator';

// Default options
const options = {
    log: false,
    structure: {
        name: 'string',
        title: 'string',
        body: 'string'
    },
    onWarning: (error, filepath) => {
        console.warn(filepath + ' has error: ' + error);
    },
    writeJson: false
};

const foldersPath = 'entries';
const commandFiles = fs
    .readdirSync(foldersPath)
    .filter((file) => file.endsWith('.yaml'))
    .map((file) => path.join(foldersPath, file));

const validator = new yamlvalidator(options);

test('Validate YAML files', (t) => {
    t.plan(1);
    validator.validate(commandFiles);
    validator.report();
    t.equal(validator.logs.length, 1);
});

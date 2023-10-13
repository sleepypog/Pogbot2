import { exec, execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const data = {
    generated: new Date().toISOString(),
    version: null,
    commit: null,
};

function getLatestCommit() {
    const commit = execSync('git log -n1 --format="%h"');
    return commit.toString().trim();
}

(data.version = process.env.npm_package_version),
    (data.commit = getLatestCommit());

writeFileSync('version.json', JSON.stringify(data, null, 2));

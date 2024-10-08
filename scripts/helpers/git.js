const cp = require('node:child_process');
const path = require('node:path');
const constants = require('./constants');

async function getCurrentChanges() {
    const changed = new Promise((resolve, reject) => {
        cp.exec('git diff-index --name-only --diff-filter=d HEAD', (error, stdout, _stderr) => {
            if (error) {
                return reject(error);
            }

            resolve(stdout.split('\n'));
        });
    });
    const untracked = new Promise((resolve, reject) => {
        cp.exec('git ls-files --others --exclude-standard', (error, stdout, _stderr) => {
            if (error) {
                return reject(error);
            }

            resolve(stdout.split('\n'));
        });
    });

    try {
        const [ changedList, untrackedList ] = await Promise.all([ changed, untracked ]);
        const files = ([]).concat(changedList, untrackedList);
        return files.filter(file => constants.ALLOWED_EXTENSIONS.has(path.extname(file)) && file.startsWith('src/'));
    } catch (error) {
        throw error;
    }
}

async function stageFiles(files = '.') {
    return await cp.exec(`git add ${files}`);
}

async function getMainBranch() {
    return new Promise((resolve, reject) => {
        cp.exec('git remote show origin', (error, stdout) => {
            if (error) {
                return reject(error);
            }

            const lines = stdout.split('\n').map(line => line.trim());
            resolve(lines.find(line => line.startsWith('HEAD branch:'))?.split(' ').pop())
        });
    });
}

async function getCurrentBranch() {
    return new Promise((resolve, reject) => {
        cp.exec('git rev-parse --abbrev-ref HEAD', (error, stdout) => {
            if (error) {
                return reject(error);
            }

            resolve(stdout.trim());
        });
    });
}

async function getMergeBase(curBranch) {
    const currentBranch = curBranch ?? await getCurrentBranch();
    const mainBranch = await getMainBranch();

    return new Promise((resolve, reject) => {
        cp.exec(`git merge-base ${currentBranch} ${mainBranch}`, (error, stdout) => {
            if (error) {
                return reject(error);
            }

            resolve(stdout.trim());
        });
    });
}

async function getChangesFromMergeBase() {
    const currentBranch = await getCurrentBranch();
    const mergeBase = await getMergeBase(currentBranch);

    return new Promise((resolve, reject) => {
        cp.exec(`git diff --diff-filter=a --name-status ${currentBranch} ${mergeBase}`, (error, stdout) => {
            if (error) {
                return reject(error);
            }

            resolve(
                stdout
                    .split('\n')
                    .map(line => {
                        const parts = line.split(/\s+/);
                        return parts[1];
                    })
                    .filter(Boolean)
                    .map(line => line.trim())
                    .filter(file =>
                        constants.ALLOWED_EXTENSIONS.has(path.extname(file))
                        && file.startsWith('src/')
                    )
            );
        });
    });
}

module.exports = {
    getCurrentChanges,
    stageFiles,
    getMainBranch,
    getCurrentBranch,
    getMergeBase,
    getChangesFromMergeBase,
};

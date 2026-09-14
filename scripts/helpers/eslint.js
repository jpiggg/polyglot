const cp = require('node:child_process');

async function lint(files) {
    return new Promise((resolve, reject) => {
        const eslintProcess = cp.spawn('pnpm exec eslint --fix ' + files, { shell: true, stdio: 'inherit' });
        eslintProcess.on('exit', (code) => {
            resolve(code);
        });
    })
}

module.exports = {
    lint,
};

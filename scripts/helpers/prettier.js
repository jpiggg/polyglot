const cp = require('node:child_process');

async function prettify(files) {
    return new Promise((resolve, reject) => {
        const prettierProcess = cp.spawn('pnpm exec prettier --write ' + files, { shell: true, stdio: 'inherit' });
        prettierProcess.on('exit', (code) => {
            resolve(code);
        });
    })
}

module.exports = {
    prettify,
};

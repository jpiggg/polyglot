const path = require('node:path');
const nodeExternals = require('webpack-node-externals');
const { createWebpackConfig } = require('../base/createWebpackConfig');
const styleLoader = require('../base/styleLoader');
const imageLoader = require('../base/imageLoader');

module.exports = createWebpackConfig({
	mode: 'development',
	entry: path.resolve(__dirname, '../../src/server/index.ts'),
	output: {
		path: path.resolve(__dirname, '../../dist/server'),
		filename: 'index.js',
	},
	rules: [
		styleLoader({
			isScss: true,
			prodEnv: false,
			isServer: true,
		}),
		imageLoader({
			isServer: true,
		}),
	],
	externals: [nodeExternals()],
});

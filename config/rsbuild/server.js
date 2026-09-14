const path = require('node:path');
const nodeExternals = require('webpack-node-externals');
const { defineConfig } = require('@rsbuild/core');
const { pluginReact } = require('@rsbuild/plugin-react');
const { pluginSass } = require('@rsbuild/plugin-sass');

module.exports = defineConfig({
	plugins: [pluginReact(), pluginSass()],
	source: {
		entry: {
			index: path.resolve(__dirname, '../../src/server/index.ts'),
		},
	},
	output: {
		distPath: {
			root: path.resolve(__dirname, '../../dist/server'),
		},
		filename: {
			js: 'index.js',
		},
		module: false,
		target: 'node',
		disableCssExtract: true,
		cssModules: {
			auto: (resourcePath) => resourcePath.endsWith('.scss') && !resourcePath.endsWith('global.scss'),
		},
	},
	tools: {
		rspack: {
			externals: [nodeExternals()],
			module: {
				rules: [
					{
						resourceQuery: /raw/,
						type: 'asset/source',
					},
				],
			},
		},
	},
});
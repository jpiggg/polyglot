const path = require('node:path');
const { defineConfig } = require('@rsbuild/core');
const { pluginReact } = require('@rsbuild/plugin-react');
const { pluginSass } = require('@rsbuild/plugin-sass');

const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = defineConfig({
	plugins: [pluginReact(), pluginSass()],
	source: {
		entry: {
			global: path.resolve(__dirname, '../../src/client/global.scss'),
			index: path.resolve(__dirname, '../../src/client/index.tsx'),
		},
	},
	output: {
		distPath: {
			root: path.resolve(__dirname, '../../dist/client'),
		},
		assetPrefix: isDevelopment ? 'http://localhost:3000/' : '/dist/',
		filename: {
			js: '[name].[contenthash:8].js',
			css: '[name].[contenthash:8].css',
		},
		manifest: true,
		cssModules: {
			auto: (resourcePath) => resourcePath.endsWith('.scss') && !resourcePath.endsWith('global.scss'),
		},
	},
	tools: {
		cssLoader: {
			url: false,
		},
	},
	dev: {
		writeToDisk: true,
	},
	server: {
		cors: true,
		port: 3000,
		strictPort: true,
	},
	performance: {
		removeMomentLocale: true,
	},
});
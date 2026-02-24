// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver = config.resolver || {};

// Виключаємо backend код з bundle
config.resolver.blockList = [
	new RegExp(path.resolve(__dirname, '../dist') + '/.*'),
	new RegExp(path.resolve(__dirname, '../src') + '/.*'),
	new RegExp(path.resolve(__dirname, '../prisma') + '/.*'),
	new RegExp(path.resolve(__dirname, '../scripts') + '/.*'),
	new RegExp(path.resolve(__dirname, '../backups') + '/.*'),
	new RegExp(path.resolve(__dirname, '../admin-panel') + '/.*'),
	new RegExp(path.resolve(__dirname, '../staff-panel') + '/.*'),
	new RegExp(path.resolve(__dirname, '../mobile') + '/.*'),
];

const axiosPackageDir = path.dirname(require.resolve('axios/package.json'));
const axiosBrowserBuild = path.join(axiosPackageDir, 'dist', 'browser', 'axios.cjs');

config.resolver.extraNodeModules = {
	...(config.resolver.extraNodeModules || {}),
	axios: axiosBrowserBuild,
};

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
	if (moduleName === 'axios') {
		return { filePath: axiosBrowserBuild, type: 'sourceFile' };
	}
	if (originalResolveRequest) {
		return originalResolveRequest(context, moduleName, platform);
	}
	return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

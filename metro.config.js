const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
   
    if (moduleName === 'zustand' || moduleName.startsWith('zustand/')) {
        //? Resolve to its CommonJS entry (fallback to main/index.js)
        return {
            type: 'sourceFile',
            //? require.resolve will pick up the CJS entry (index.js) since "exports" is bypassed
            filePath: require.resolve(moduleName),
        };
    }

    return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });

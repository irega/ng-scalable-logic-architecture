const path = require('path');

module.exports = {
    getConfig: function (taskName, manufacturer, tsConfigPath, transformTsConfig) {
        const baseConfigPath = path.resolve(process.env.npm_package_config_webpackBaseConfigPath, '.');
        delete require.cache[require.resolve(baseConfigPath)]
        return require(baseConfigPath);
    }
};

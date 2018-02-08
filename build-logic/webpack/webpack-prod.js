const base = require('./webpack-base'),
    path = require('path'),
    gutil = require('gulp-util'),
    webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin');

function transformConfig(config, manufacturer) {
    config.output.filename = '[name].[hash].bundle.js';
    config.output.chunkFilename = '[id].[hash].chunk.js';
    config.output.path = path.resolve(process.env.npm_package_config_distPath, '.') + '/' + manufacturer;

    config.plugins.push(
        new HtmlWebpackPlugin({
            inject: 'body',
            template: process.env.npm_package_config_indexPath
        }));
    return config;
}

module.exports = {
    start: function (manufacturer, callback) {
        var baseConfig = base.getConfig();
        webpack(transformConfig(Object.create(baseConfig), manufacturer), function (err, stats) {
            if (err) throw new gutil.PluginError('webpack-prod', err);
            gutil.log('[webpack-prod]', stats.toString({
                colors: true
            }));
            callback();
        });
    }
};

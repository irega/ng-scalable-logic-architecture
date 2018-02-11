const base = require('./webpack-base'),
    path = require('path'),
    gutil = require('gulp-util'),
    webpack = require('webpack'),
    ngToolsWebpack = require('@ngtools/webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin');

function transformConfig(config, manufacturer) {
    const TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin;
    config.entry.app = process.env.npm_package_config_mainAotPath;
    config.output.filename = '[name].[hash].bundle.js';
    config.output.chunkFilename = '[id].[hash].chunk.js';
    config.output.path = path.resolve(process.env.npm_package_config_distPath, '.') + '/' + manufacturer;
    config.resolve.plugins = [
        new TsConfigPathsPlugin({
            tsconfig: process.env.npm_package_config_tsConfigAotPath,
            compiler: 'typescript'
        })
    ];
    config.module.rules.push({
        test: /\.ts$/,
        loader: '@ngtools/webpack'
    });
    config.plugins.push(new ngToolsWebpack.AotPlugin({
        tsConfigPath: process.env.npm_package_config_tsConfigAotPath
    }));
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        },
        output: {
            comments: false
        },
        sourceMap: false
    }));
    config.plugins.push(new HtmlWebpackPlugin({
        inject: 'body',
        template: process.env.npm_package_config_indexPath
    }));
    return config;
}
module.exports = {
    start: function(manufacturer, callback) {
        var baseConfig = base.getConfig();
        webpack(transformConfig(Object.create(baseConfig), manufacturer), function(err, stats) {
            if (err) throw new gutil.PluginError('webpack-prod', err);
            gutil.log('[webpack-prod]', stats.toString({
                colors: true
            }));
            callback();
        });
    }
};
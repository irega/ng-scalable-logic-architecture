const base = require('./webpack-base'),
    webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin');

function transformConfig(config, manufacturer) {
    const TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin;
    config.devtool = 'source-map';
    config.performance = {
        hints: false
    };
    config.entry['webpack/hot/dev-server'] = 'webpack/hot/dev-server';
    config.entry['webpack-hot-middleware/client'] = 'webpack-hot-middleware/client';
    config.entry.app = process.env.npm_package_config_mainPath;
    config.output.filename = manufacturer + '/[name].[hash].bundle.js';
    config.output.chunkFilename = manufacturer + '/[id].[hash].chunk.js';
    config.resolve.plugins = [
        new TsConfigPathsPlugin({
            tsconfig: process.env.npm_package_config_tsConfigPath,
            compiler: 'typescript'
        })
    ];
    config.module.rules.push({
        test: /\.ts$/,
        use: ['awesome-typescript-loader', 'angular-router-loader', 'angular2-template-loader', 'source-map-loader']
    });
    config.module.rules.push({
        test: /\.ts$/,
        enforce: 'pre',
        loader: 'tslint-loader',
        options: {
            typeCheck: true
        }
    });
    
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
    config.plugins.push(new HtmlWebpackPlugin({
        inject: 'body',
        template: process.env.npm_package_config_indexPath
    }));
    return config;
}
module.exports = {
    startServer: function(manufacturer) {
        var baseConfig = base.getConfig();
        var config = transformConfig(Object.create(baseConfig), manufacturer);
        const express = require('express');
        const webpackDevMiddleware = require('webpack-dev-middleware');
        const webpackHotMiddleware = require('webpack-hot-middleware');
        const app = express();
        const compiler = webpack(config);
        app.use(webpackDevMiddleware(compiler, {
            stats: {
                colors: true
            },
            publicPath: config.output.publicPath
        }));
        app.use(webpackHotMiddleware(compiler));
        const port = process.env.npm_package_config_devServerPort;
        app.listen(port, function() {
            console.log('Webpack DevServer listening on port ' + port + '!\n');
        });
    }
};
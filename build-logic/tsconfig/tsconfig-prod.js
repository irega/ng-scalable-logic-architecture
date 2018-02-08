const del = require('del'),
    base = require('./tsconfig-base'),
    gutil = require('gulp-util');

module.exports = {
    transform: function (manufacturer, data) {
        return new Promise(function (resolve, reject) {
            base.generateJsonWithAliasesAndPaths(base.transformJsonWithAliasesAndPaths.bind(this, manufacturer))
                .on('end', function () {
                    var paths = base.getManufacturersPathsJson();

                    data.compilerOptions.sourceMap = false;
                    data.compilerOptions.suppressImplicitAnyIndexErrors = true;
                    data.angularCompilerOptions = {
                        "genDir": process.env.npm_package_config_aotPath,
                        "entryModule": process.env.npm_package_config_clientAppPath + '/app.module#AppModule',
                        "skipMetadataEmit": true
                    };
                    delete data.compilerOptions.typeRoots;
                    delete data.awesomeTypescriptLoaderOptions;

                    paths.exclude.push(process.env.npm_package_config_mainPath.replace('./', ''));
                    gutil.log('[Manufacturer ' + manufacturer + ']: *.ts files ignored in the build: ');
                    gutil.log(paths.exclude);
                    delete data.exclude;
                    paths.exclude.push('node_modules');
                    data.exclude = paths.exclude;
                    delete paths.exclude;

                    gutil.log('[Manufacturer ' + manufacturer + ']: *.ts files included in the build: ');
                    gutil.log(paths);
                    data.compilerOptions.paths = paths;

                    del([process.env.npm_package_config_tmpFolderPath]).then(function () {
                        resolve(data);
                    });
                });
        });
    }
};

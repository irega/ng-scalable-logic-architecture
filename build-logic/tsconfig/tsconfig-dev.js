const del = require('del'),
    base = require('./tsconfig-base');

module.exports = {
    transform: function (manufacturer, data) {
        return new Promise(function (resolve, reject) {
            base.generateJsonWithAliasesAndPaths(base.transformJsonWithAliasesAndPaths.bind(this, manufacturer))
                .on('end', function () {
                    var paths = base.getManufacturersPathsJson();

                    data.exclude = ['node_modules',
                        process.env.npm_package_config_mainAotPath.replace('./', ''),
                        process.env.npm_package_config_aotPath.replace('./', '')
                    ].concat(paths.exclude);
                    delete paths.exclude;

                    data.compilerOptions.paths = paths;

                    del([process.env.npm_package_config_tmpFolderPath]).then(function () {
                        resolve(data);
                    });
                });
        });
    }
};

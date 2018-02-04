const gulp = require('gulp'),
    gutil = require('gulp-util'),
    webpack = require('webpack'),
    runSequence = require('run-sequence'),
    del = require('del'),
    path = require('path'),
    ROOT = path.resolve(__dirname, '.'),
    jsonTransform = require('gulp-json-transform'),
    TYPESCRIPT_EXTENSION = '.ts',
    JSON_MANUFACTURERS_PATHS_FILE_NAME = 'filelist.json';

gulp.task('clean-tsconfig', function () {
    return deleteTsConfig(process.env.npm_package_config_tsConfigPath);
});

gulp.task('clean-tsconfig-aot', function () {
    return deleteTsConfig(process.env.npm_package_config_tsConfigAotPath);
});

function deleteTsConfig(tsConfigPath) {
    return del([tsConfigPath]);
}

gulp.task('create-tsconfig', ['clean-tsconfig'], function () {
    const manufacturer = getManufacturerFromArgs();
    return generateTsConfigForManufacturer('create-tsconfig', manufacturer,
        process.env.npm_package_config_tsConfigPath,
        transformDevelopmentTsConfig.bind(this, manufacturer));
});

function getManufacturerFromArgs() {
    var manufacturerArgIndex = process.argv.indexOf('--' + process.env.npm_package_config_manufacturerArg),
        allManufacturers = getAllManufacturers(),
        manufacturer = allManufacturers[0];

    if (manufacturerArgIndex > -1) {
        manufacturer = process.argv[manufacturerArgIndex + 1];
    }
    return manufacturer;
}

function getAllManufacturers() {
    const allManufacturersFromConfig = process.env.npm_package_config_manufacturers;
    return allManufacturersFromConfig.split(';');
}

function generateTsConfigForManufacturer(taskName, manufacturer, tsConfigPath, transformTsConfig) {
    validateManufacturer(taskName, manufacturer);

    const tsConfigName = path.basename(tsConfigPath),
        tsConfigDestination = path.dirname(tsConfigPath),
        rename = require('gulp-rename');

    return gulp.src(process.env.npm_package_config_tsConfigBasePath)
        .pipe(jsonTransform(transformTsConfig))
        .pipe(rename(tsConfigName))
        .pipe(gulp.dest(tsConfigDestination));
}

function validateManufacturer(taskName, manufacturer) {
    if (!manufacturer) {
        throw new gutil.PluginError({
            task: taskName,
            message: 'Incorrect car manufacturer.'
        });
    }
}

function transformDevelopmentTsConfig(manufacturer, data) {
    return new Promise(function (resolve, reject) {
        generateJsonWithAliasesAndPaths(manufacturer, transformDevelopmentJsonWithAliasesAndPaths.bind(this, manufacturer))
            .on('end', function () {
                var paths = getManufacturersPathsJson();
                data.compilerOptions.paths = paths;
                del([process.env.npm_package_config_tmpFolderPath]).then(function () {
                    resolve(data);
                });
            });
    });
}

function generateJsonWithAliasesAndPaths(manufacturer, transformJson) {
    const fileList = require('gulp-filelist'),
        sort = require('gulp-sort'),
        fileNameStartsWithAtAnyFolderFilter = '/**/*.';

    var paths = {},
        allManufacturers = getAllManufacturers(),
        filesWithAtLeastOneManufacturer = [];

    allManufacturers.forEach(function (man) {
        filesWithAtLeastOneManufacturer.push(process.env.npm_package_config_clientAppPath +
            fileNameStartsWithAtAnyFolderFilter + man + TYPESCRIPT_EXTENSION);
    });
    return gulp.src(filesWithAtLeastOneManufacturer)
        .pipe(sort())
        .pipe(fileList(JSON_MANUFACTURERS_PATHS_FILE_NAME))
        .pipe(jsonTransform(transformJson))
        .pipe(gulp.dest(process.env.npm_package_config_tmpFolderPath));
}

function transformDevelopmentJsonWithAliasesAndPaths(manufacturer, data) {
    var jsonTransformed = {};
    data.forEach(function (path) {
        var alias = getAliasFromManufacturerTsFile(path);
        if (!jsonTransformed[alias]) {
            jsonTransformed[alias] = [getBaseFileFromManufacturerTsFile(path)];
        }
        var isManufacturerFilePath = path.indexOf('.' + manufacturer.toString().toUpperCase() + TYPESCRIPT_EXTENSION) > -1;
        if (isManufacturerFilePath) {
            jsonTransformed[alias] = [path];
        }
    });
    return jsonTransformed;
}

function getAliasFromManufacturerTsFile(manufacturerFilePath) {
    const actualFolderPrefix = './';
    var clientAppPath = process.env.npm_package_config_clientAppPath;
    if (clientAppPath.startsWith(actualFolderPrefix)) {
        clientAppPath = clientAppPath.substring(actualFolderPrefix.length - 1);
    }
    var alias = manufacturerFilePath.replace(clientAppPath, '')
        .replace(/\//g, process.env.npm_package_config_aliasPathSeparator);

    return removeManufacturerFromPath(alias);
}

function removeManufacturerFromPath(fileName) {
    var lastDotIndex = fileName.lastIndexOf('.'),
        fileNameWithoutLastDot = fileName.substring(0, lastDotIndex),
        penultimateDotIndex = fileNameWithoutLastDot.lastIndexOf('.');

    return fileName.substring(0, penultimateDotIndex);
}

function getBaseFileFromManufacturerTsFile(manufacturerFilePath) {
    return removeManufacturerFromPath(manufacturerFilePath) + TYPESCRIPT_EXTENSION;
}

function getManufacturersPathsJson() {
    const jsonPath = process.env.npm_package_config_tmpFolderPath + '/' +
        JSON_MANUFACTURERS_PATHS_FILE_NAME;
    delete require.cache[require.resolve(jsonPath)]
    return require(jsonPath);
}

gulp.task('build-dev', function () {
    const manufacturer = getManufacturerFromArgs();
    validateManufacturer('build-dev', manufacturer);

    runSequence('build-dev-' + manufacturer, function () {
        startDevServer();
    });
});

function startDevServer() {
    // TODO
}

gulp.task('clean-dist', function () {
    const ALL_FILES_FILTER = '/**',
        NOT_OPERATOR_FILTER = '!';

    return del([process.env.npm_package_config_distPath + ALL_FILES_FILTER,
    NOT_OPERATOR_FILTER + process.env.npm_package_config_distPath]);
});

gulp.task('clean-aot', function () {
    return del([process.env.npm_package_config_aotPath]);
});

gulp.task('aot', function (callback) {
    return require('gulp-ngc')(process.env.npm_package_config_tsConfigAotPath);
});

gulp.task('build-prod', ['clean-dist'], function (callback) {
    var tasksToExecute = [],
        allManufacturers = getAllManufacturers();

    allManufacturers.forEach(function (manufacurer) {
        tasksToExecute.push('build-prod-' + manufacurer);
        tasksToExecute.push('clean-aot');
        tasksToExecute.push('aot');
        tasksToExecute.push('webpack-prod-' + manufacurer);
    });
    tasksToExecute.push(callback);

    return runSequence.apply(this, tasksToExecute);
});

function transformProductionTsConfig(manufacturer, data) {
    return new Promise(function (resolve, reject) {
        generateJsonWithAliasesAndPaths(manufacturer, transformProductionJsonWithAliasesAndPaths.bind(this, manufacturer))
            .on('end', function () {
                var paths = getManufacturersPathsJson();

                data.compilerOptions.sourceMap = false;
                data.compilerOptions.suppressImplicitAnyIndexErrors = true;
                data.angularCompilerOptions = {
                    "genDir": process.env.npm_package_config_aotPath,
                    "entryModule": process.env.npm_package_config_clientAppPath + '/app.module#AppModule',
                    "skipMetadataEmit": true
                };
                delete data.compilerOptions.typeRoots;
                delete data.awesomeTypescriptLoaderOptions;

                gutil.log('[Manufacturer ' + manufacturer + ']: *.ts files ignored in the build: ');
                gutil.log(paths.exclude);
                delete data.exclude;
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

function transformProductionJsonWithAliasesAndPaths(manufacturer, data) {
    var jsonTransformed = {},
        actualAlias = '',
        actualBaseFilePath = '',
        previousAlias = '',
        previousBaseFilePath = '',
        manufacturersPreviousAliasCount = 0;

    const manufacturersCount = getAllManufacturers().length,
        manufacturerUpper = manufacturer.toString().toUpperCase();

    jsonTransformed.exclude = [];

    for (var i = 0; i < data.length; i++) {
        var path = data[i];

        actualAlias = getAliasFromManufacturerTsFile(path);
        actualBaseFilePath = getBaseFileFromManufacturerTsFile(path);

        if (!jsonTransformed[aliasActual]) {
            jsonTransformed[aliasActual] = [actualBaseFilePath];
        }
        var isManufacturerFilePath = path.indexOf('.' + manufacturerUpper + TYPESCRIPT_EXTENSION) > -1;
        if (isManufacturerFilePath) {
            jsonTransformed[actualAlias] = [path];
        }
        else {
            jsonTransformed.exclude.push(path);
        }

        var isFirstIteration = (i === 0);
        if (isFirstIteration) {
            previousAlias = actualAlias;
            previousBaseFilePath = actualBaseFilePath;
            manufacturersPreviousAliasCount = 1;
        } else {
            if (actualAlias !== previousAlias) {
                excludeBaseFileIfExistsManufacturerFilePath(manufacturersCount, manufacturerUpper, jsonTransformed,
                    previousAlias, manufacturersPreviousAliasCount, previousBaseFilePath);

                previousAlias = aliasActual;
                pathArchivoBaseAnterior = actualBaseFilePath;
                manufacturersPreviousAliasCount = 1;
            }
            else {
                manufacturersPreviousAliasCount++;
            }
        }
    }

    if (data.length > 0) {
        excludeBaseFileIfExistsManufacturerFilePath(manufacturersCount, manufacturerUpper, jsonTransformed,
            previousAlias, manufacturersPreviousAliasCount, previousBaseFilePath);
    }
    return jsonTransformed;
}

function excludeBaseFileIfExistsManufacturerFilePath(manufacturersCount, manufacturerUpper,
    jsonTransformed, previousAlias, manufacturersPreviousAliasCount, previousBaseFilePath) {

    var existsFilePathForAllManufacturers = (manufacturersPreviousAliasCount === manufacturersCount),
        existsManufacturerFilePath = jsonTransformed[previousAlias][0].indexOf('.' + manufacturerUpper + TYPESCRIPT_EXTENSION) > -1;

    if (!existsFilePathForAllManufacturers && existsManufacturerFilePath) {
        jsonTransformed.exclude.push(previousBaseFilePath);
    }
}

function webpackProduction(manufacturer, callback) {
    var baseConfig = getWebpackBaseConfig();
    webpack(transformProductionWebpackConfig(Object.create(baseConfig), manufacturer), function (err, stats) {
        if (err) throw new gutil.PluginError('webpack-prod', err);
        gutil.log('[webpack-prod]', stats.toString({
            colors: true
        }));
        callback();
    });
}

function getWebpackBaseConfig() {
    const baseConfigPath = path.join(ROOT, process.env.npm_package_config_webpackBaseConfigPath);
    delete require.cache[require.resolve(baseConfigPath)]
    return require(baseConfigPath);
}

function transformProductionWebpackConfig(config, manufacturer) {
    config.output.filename = 'dist/' + manufacturer + '/[name].[hash].bundle.js';
    config.output.chunkFilename = 'dist/' + manufacturer + '/[id].[hash].chunk.js';
    return config;
}

function createManufacturersDynamicTasks() {
    var allManufacturers = getAllManufacturers();
    allManufacturers.forEach(function (manufacturer) {
        gulp.task('build-dev-' + manufacturer,
            generateTsConfigForManufacturer.bind(this, 'build-dev-' + manufacturer, manufacturer,
                process.env.npm_package_config_tsConfigPath,
                transformDevelopmentTsConfig.bind(this, manufacturer)));

        gulp.task('build-prod-' + manufacturer,
            generateTsConfigForManufacturer.bind(this, 'build-prod-' + manufacturer, manufacturer,
                process.env.npm_package_config_tsConfigAotPath,
                transformProductionTsConfig.bind(this, manufacturer)));

        gulp.task('webpack-prod-' + manufacturer, webpackProduction.bind(this, manufacturer));
    });
}

createManufacturersDynamicTasks();

gulp.task('default', ['build-prod']);

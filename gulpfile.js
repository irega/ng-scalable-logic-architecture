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

function createDynamicTasks() {
}

createDynamicTasks();

gulp.task('default', ['build-prod']);

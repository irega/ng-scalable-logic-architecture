const gulp = require('gulp'),
    jsonTransform = require('gulp-json-transform'),
    manufacturer = require('../manufacturer'),
    TYPESCRIPT_EXTENSION = '.ts',
    JSON_MANUFACTURERS_PATHS_FILE_NAME = 'filelist.json',
    path = require('path');

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

function getBaseFileFromManufacturerTsFile(manufacturerFilePath) {
    return removeManufacturerFromPath(manufacturerFilePath) + TYPESCRIPT_EXTENSION;
}

function removeManufacturerFromPath(fileName) {
    var lastDotIndex = fileName.lastIndexOf('.'),
        fileNameWithoutLastDot = fileName.substring(0, lastDotIndex),
        penultimateDotIndex = fileNameWithoutLastDot.lastIndexOf('.');

    return fileName.substring(0, penultimateDotIndex);
}

function excludeBaseFileIfExistsManufacturerFilePath(manufacturersCount, manufacturerUpper,
    jsonTransformed, previousAlias, manufacturersPreviousAliasCount, previousBaseFilePath) {

    var existsFilePathForAllManufacturers = (manufacturersPreviousAliasCount === manufacturersCount),
        jsonPreviousAliasUpperCase = jsonTransformed[previousAlias][0].toUpperCase(),
        existsManufacturerFilePath = jsonPreviousAliasUpperCase.indexOf('.' + manufacturerUpper + TYPESCRIPT_EXTENSION.toUpperCase()) > -1;

    if (!existsFilePathForAllManufacturers && existsManufacturerFilePath) {
        jsonTransformed.exclude.push(previousBaseFilePath);
    }
}

module.exports = {
    generateJsonWithAliasesAndPaths: function (transformJson) {
        const fileList = require('gulp-filelist'),
            sort = require('gulp-sort'),
            fileNameStartsWithAtAnyFolderFilter = '/**/*.';

        var paths = {},
            allManufacturers = manufacturer.getAll(),
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
    },
    transformJsonWithAliasesAndPaths: function (man, data) {
        var jsonTransformed = {},
            actualAlias = '',
            actualBaseFilePath = '',
            previousAlias = '',
            previousBaseFilePath = '',
            manufacturersPreviousAliasCount = 0;

        const manufacturersCount = manufacturer.getAll().length,
            manufacturerUpper = man.toString().toUpperCase();

        jsonTransformed.exclude = [];

        for (var i = 0; i < data.length; i++) {
            var path = data[i];

            actualAlias = getAliasFromManufacturerTsFile(path);
            actualBaseFilePath = getBaseFileFromManufacturerTsFile(path);

            if (!jsonTransformed[actualAlias]) {
                jsonTransformed[actualAlias] = [actualBaseFilePath];
            }

            var pathUpperCase = path.toString().toUpperCase();
            var isManufacturerFilePath = pathUpperCase.indexOf('.' + manufacturerUpper + TYPESCRIPT_EXTENSION.toUpperCase()) > -1;
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

                    previousAlias = actualAlias;
                    previousBaseFilePath = actualBaseFilePath;
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
    },
    getManufacturersPathsJson: function () {
        var jsonPath = path.resolve(process.env.npm_package_config_tmpFolderPath, '.');
        jsonPath += '/' + JSON_MANUFACTURERS_PATHS_FILE_NAME;

        delete require.cache[require.resolve(jsonPath)]
        return require(jsonPath);
    }
};

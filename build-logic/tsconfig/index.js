const gulp = require('gulp'),
    dev = require('./tsconfig-dev'),
    prod = require('./tsconfig-prod'),
    del = require('del'),
    manufacturer = require('../manufacturer'),
    path = require('path'),
    jsonTransform = require('gulp-json-transform'),
    rename = require('gulp-rename');

module.exports = {
    delete: function (tsConfigPath) {
        return del([tsConfigPath]);
    },
    generateForManufacturer: function (taskName, man, tsConfigPath, transformTsConfig) {
        manufacturer.validate(taskName, man);

        const tsConfigName = path.basename(tsConfigPath),
            tsConfigDestination = path.dirname(tsConfigPath);

        return gulp.src(process.env.npm_package_config_tsConfigBasePath)
            .pipe(jsonTransform(transformTsConfig))
            .pipe(rename(tsConfigName))
            .pipe(gulp.dest(tsConfigDestination));
    },
    dev: dev,
    prod: prod
};
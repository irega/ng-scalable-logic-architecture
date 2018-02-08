const gulp = require('gulp'),
    runSequence = require('run-sequence'),
    del = require('del'),
    manufacturer = require('./build-logic/manufacturer'),
    tsConfig = require('./build-logic/tsconfig'),
    webpack = require('./build-logic/webpack');

gulp.task('clean-tsconfig', function () {
    return tsConfig.delete(process.env.npm_package_config_tsConfigPath);
});

gulp.task('clean-tsconfig-aot', function () {
    return tsConfig.delete(process.env.npm_package_config_tsConfigAotPath);
});

gulp.task('create-tsconfig', ['clean-tsconfig'], function () {
    const man = manufacturer.getFromArgs();
    return tsConfig.generateForManufacturer('create-tsconfig', man,
        process.env.npm_package_config_tsConfigPath,
        tsConfig.dev.transform.bind(this, man));
});


gulp.task('build-dev', function () {
    const man = manufacturer.getFromArgs();
    manufacturer.validate('build-dev', man);

    runSequence('build-dev-' + man, function () {
        webpack.dev.startServer(man);
    });
});

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
        allManufacturers = manufacturer.getAll();

    allManufacturers.forEach(function (manufacurer) {
        tasksToExecute.push('build-prod-' + manufacurer);
        tasksToExecute.push('clean-aot');
        tasksToExecute.push('aot');
        tasksToExecute.push('webpack-prod-' + manufacurer);
    });
    tasksToExecute.push(callback);

    return runSequence.apply(this, tasksToExecute);
});

function createManufacturersDynamicTasks() {
    var allManufacturers = manufacturer.getAll();
    allManufacturers.forEach(function (man) {
        gulp.task('build-dev-' + man,
            tsConfig.generateForManufacturer.bind(this, 'build-dev-' + man, man,
                process.env.npm_package_config_tsConfigPath,
                tsConfig.dev.transform.bind(this, man)));

        gulp.task('build-prod-' + man,
            tsConfig.generateForManufacturer.bind(this, 'build-prod-' + man, man,
                process.env.npm_package_config_tsConfigAotPath,
                tsConfig.prod.transform.bind(this, man)));

        gulp.task('webpack-prod-' + man, webpack.prod.start.bind(this, man));
    });
}

createManufacturersDynamicTasks();

gulp.task('default', ['build-prod']);

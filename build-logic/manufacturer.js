const gulp = require('gulp'),
    gutil = require('gulp-util');

function getAll() {
    const allManufacturersFromConfig = process.env.npm_package_config_manufacturers;
    return allManufacturersFromConfig.split(';');
}

module.exports = {
    getFromArgs: function () {
        var manufacturerArgIndex = process.argv.indexOf('--' + process.env.npm_package_config_manufacturerArg),
            allManufacturers = getAll(),
            manufacturer = allManufacturers[0];

        if (manufacturerArgIndex > -1) {
            manufacturer = process.argv[manufacturerArgIndex + 1];
        }
        return manufacturer;
    },
    getAll: getAll,
    validate: function (taskName, manufacturer) {
        if (!manufacturer) {
            throw new gutil.PluginError({
                task: taskName,
                message: 'Incorrect car manufacturer.'
            });
        }
    }
};

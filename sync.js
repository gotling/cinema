const fs = require('fs');
const path = require('path');
var config = require('config');
var request = require('request');
var progress = require('request-progress');

const rootFolder = '/movies/';
const imageFolder = 'Images'
const expectedImages = ['fanart.jpg', 'landscape.jpg', 'logo.png', 'poster.jpg'];
const expectedMovieExtension = ['.mkv', '.mp4'];
const expectedSubtitleExtension = '.srt';

exports.folderExists = function folderExists(folder) {
    return fs.existsSync(path.join(rootFolder, folder));
}

exports.missingFiles = function missingFiles(folder) {
    var missing = [];

    if (!fs.existsSync(path.join(rootFolder, folder, folder + expectedSubtitleExtension))) {
        missing.push('subtitle');
    }

    var movieExists = false;

    for (var extension of expectedMovieExtension) {
        if (fs.existsSync(path.join(rootFolder, folder, folder + extension))) {
            movieExists = true;
        }
    }

    if (!movieExists) {
        missing.push('movie');
    }

    for (var image of expectedImages) {
        if (!fs.existsSync(path.join(rootFolder, folder, 'Images', image))) {
            missing.push(image);
        }
    }

    return missing;
}

exports.getBaseName = function getBaseName(movie) {
    return `${movie.Name} (${movie.ProductionYear})`;
}

exports.getExpectedFolders = function getExpectedFolders(playlist) {
    let expected = [];
    for (let movie of playlist) {
        expected.push(this.getBaseName(movie));
    }

    return expected;
}

exports.getActualFolders = function getActualFolders() {
    return getFolders(config.get('cinema.movie-folder'));
}

function createFolderStructure(movie) {
    var baseName = getBaseName(movie);
}

function getFolders(dir) {
    let files = fs.readdirSync(dir);
    let folders = [];
    for (let file of files) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            folders.push(file);
        }
    }

    return folders;
}

exports.downloadFile = function downloadFile(url, fileName) {
    progress(request(url), {
        // throttle: 2000,                    // Throttle the progress event to 2000ms, defaults to 1000ms
        // delay: 1000,                       // Only start to emit after 1000ms delay, defaults to 0ms
        // lengthHeader: 'x-transfer-length'  // Length header to use, defaults to content-length
    })
    .on('progress', function (state) {
        // The state is an object that looks like this:
        // {
        //     percent: 0.5,               // Overall percent (between 0 to 1)
        //     speed: 554732,              // The download speed in bytes/sec
        //     size: {
        //         total: 90044871,        // The total payload size in bytes
        //         transferred: 27610959   // The transferred payload size in bytes
        //     },
        //     time: {
        //         elapsed: 36.235,        // The total elapsed seconds since the start (3 decimals)
        //         remaining: 81.403       // The remaining seconds to finish (3 decimals)
        //     }
        // }
        console.log('progress', state);
    })
    .on('error', function (err) {
        console.log(err);
        // Do something with err
    })
    .on('end', function () {
        console.log('ended');
        // Do something after request finishes
    })
    .pipe(fs.createWriteStream(fileName));
}

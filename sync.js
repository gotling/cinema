const fs = require('fs');
const path = require('path');
var config = require('config');
var request = require('request');
var progress = require('request-progress');
var rimraf = require('rimraf');
var logger = require('winston');

var emby = require('./emby');

const rootFolder = '/movies/';
const imageFolder = 'Images'
const expectedImages = ['fanart.jpg', 'landscape.jpg', 'logo.png', 'poster.jpg'];
const expectedMovieExtension = ['.mkv', '.mp4'];
const expectedSubtitleExtension = '.srt';

exports.folderExists = function folderExists(folder) {
    logger.debug("Looking for folder '%s'", folder);
    return fs.existsSync(path.join(rootFolder, folder));
}

exports.fileExists = function fileExists(filePath) {
    return fs.existsSync(filePath);
}

exports.missingFiles = function missingFiles(folder) {
    logger.debug("Looking for missing files in folder '%s'", folder);
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
        if (!fs.existsSync(path.join(rootFolder, folder, imageFolder, image))) {
            missing.push(image);
        }
    }

    logger.debug("Missing files found: %j", missing);

    return missing;
}

exports.getBaseName = function getBaseName(movie) {
    let name = `${movie.Name} (${movie.ProductionYear})`;
    name = name.replace(':', ' -');
    return name;
}

exports.getExpectedFolders = function getExpectedFolders(playlist) {
    logger.debug("Getting expected folders for plalist");
    let expected = [];
    for (let movie of playlist) {
        expected.push(this.getBaseName(movie));
    }

    logger.debug("Expected folders: %j", expected);
    return expected;
}

exports.getActualFolders = function getActualFolders() {
    return getFolders(config.get('cinema.movie-folder'));
}

exports.getExtraFolders = function getExtraFolders(playlist) {
    logger.debug("Getting folders not in playlist");
    let expectedFolders = exports.getExpectedFolders(playlist);
    let actualFolders = exports.getActualFolders();
    let extraFolders = [];

    for (let actualFolder of actualFolders) {
        if (expectedFolders.indexOf(actualFolder) === -1) {
            extraFolders.push(actualFolder);
        }
    }

    logger.debug("Extra folders found: %j");
    return extraFolders;
}

exports.deleteExtraFolders = function deleteExtraFolders(playlist) {
    logger.debug("Deleting extra folders");
    let foldersToDelete = exports.getExtraFolders(playlist);
    logger.debug("Extra folders to delete: %j", foldersToDelete);

    for (let folder of foldersToDelete) {
        let folderToDelete = path.join(config.get('cinema.movie-folder'), folder);
        rimraf.sync(folderToDelete);
    }
}

exports.getMovieFilePath = function getMovieFilePath(movie) {
    let baseName = exports.getBaseName(movie);
    let extension = movie.Container;
    let fileName = baseName + '.' + extension;
    let basePath = path.join(config.get('cinema.movie-folder'), baseName);
    let filePath = path.join(basePath, fileName);

    return filePath;
}

exports.getMovieImagePath = function getMovieImagePath(movie) {
    let baseName = exports.getBaseName(movie);
    return path.join(config.get('cinema.movie-folder'), baseName, imageFolder);
}

exports.downloadMissingFiles = function downloadMissingFiles(playlist) {
    for (let movie of playlist) {
        createFolderStructure(movie);
    }
}

exports.downloadMovieFiles = function downloadMovieFiles(movie) {
    createFolderStructure(movie);
    downloadImages(movie);
    downloadMovie(movie);
}

exports.downloadImages = function downloadImages(movie) {
    let baseName = exports.getBaseName(movie);
    let basePath = path.join(config.get('cinema.movie-folder'), baseName, imageFolder);
    let images = emby.getImages(movie);
    for (let image of images) {
        let filePath = path.join(basePath, image.filename);
        let url = emby.getImageUrl(movie, image.type);
        if (exports.fileExists(filePath)) {
            let urlSize = exports.getUrlFileSize(url);
            // TODO: Check actual filesize and download again if different
            logger.info("Image '%s' already exists", image.filename);
        } else {
            exports.downloadFile(url, path.join(basePath, image.filename));
        }
    }
}

exports.downloadMovie = function downloadMovie(movie) {
    let baseName = exports.getBaseName(movie);
    let extension = movie.Container;
    let fileName = baseName + '.' + extension;
    let basePath = path.join(config.get('cinema.movie-folder'), baseName);
    let filePath = path.join(basePath, fileName);
    let url = emby.getMovieUrl(movie);

    if (exports.fileExists(filePath)) {
        let urlSize = exports.getUrlFileSize(url);
        // TODO: Check actual filesize and download again if different
        logger.info("Movie '%s' alredy exists", fileName);
    } else {
        exports.downloadFile(url, path.join(basePath, baseName + '.' + extension));
    }
}

function createFolder(dir) {
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
}

exports.createFolderStructure = function createFolderStructure(movie) {
    logger.debug("Creating folder structure");
    var baseName = exports.getBaseName(movie);
    var basePath = path.join(config.get('cinema.movie-folder'), baseName);
    createFolder(basePath);
    createFolder(path.join(basePath, 'Images'));
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

function byteToString(bytes) {
    if (bytes >= 1048576) {
        return Math.round(bytes / 1048576 * 10) / 10 + ' MiB';
    } else if (bytes >= 1024) {
        return Math.round(bytes / 1024) + ' KiB';
    } else {
        return bytes + ' B';
    }
}

function secondsToString(seconds) {
    if (seconds >= 60) {
        return Math.round(seconds / 60) + ' minutes';
    } else {
        return Math.round(seconds) + ' seconds';
    }
}

exports.getUrlFileSize = function getUrlFileSize(url) {
    var r = request.get(url)
    .on('response', function handleResponse(response) {
        r.abort();
        return Number(response.headers['content-length']) || null;
    });
}

exports.downloadFile = function downloadFile(url, fileName) {
    logger.info("'%s' download started", path.basename(fileName));
    progress(request(url), {
        throttle: 2000,                    // Throttle the progress event to 2000ms, defaults to 1000ms
        delay: 1000,                       // Only start to emit after 1000ms delay, defaults to 0ms
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
        let percent = Math.round(state.percent * 100);

        logger.info('%s: %d%% %s/%s (%s/s) ETA: %s',
            path.basename(fileName), percent, byteToString(state.size.transferred), byteToString(state.size.total), byteToString(state.speed), secondsToString(state.time.remaining));
    })
    .on('error', function (err) {
        logger.error("Failed to download file '%s': %s", fileName, err);
        // Do somethingfile with err
    })
    .on('end', function () {
        logger.info("'%s' finished downloading", path.basename(fileName));
        // Do something after request finishes
    })
    .pipe(fs.createWriteStream(fileName));
}

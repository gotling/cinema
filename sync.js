const fs = require('fs');
const path = require('path');

var rootFolder = '/movies/';
const expectedFiles = ['Images/fanart.jpg', 'Images/landscape.jpg', 'Images/logo.png', 'Images/poster.jpg'];
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

    return missing;
}

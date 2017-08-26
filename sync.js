const fs = require('fs');
const path = require('path');

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

function createFolderStructure(movie) {
    var baseName = getBaseName(movie);
}

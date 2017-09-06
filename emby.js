var fetch = require('node-fetch');
var config = require('config');
var logger = require('winston');

const embyServer = config.get('emby.server');
const embyApiKey = config.get('emby.api-key');
const embyUserId = config.get('emby.user-id');
const embyPlaylistId = config.get('emby.playlist-id');

exports.getPlaylist = function getPlaylist() {
    logger.debug("Fetching playlist from Emby server");
  return fetch(embyServer + '/Users/' + embyUserId + '/Items?parentId=' + embyPlaylistId + '&api_key=' + embyApiKey).then(function(response) {
    return response.json();
  });
}

exports.getFavourite = function getFavourite(playlist) {
    logger.debug("Getting favourite movie from Emby playlist");
    for (var item of playlist) {
        if (item.UserData.IsFavorite) {
            return item;
        }
    }

    return false;
}

exports.getImages = function getImages(movie) {
    // poster.jpg, logo.png, landscape.jpg, fanart.jpg
    // Type: Primary, Logo, Thumb, Backdrop
    let images = [];

    if ("Primary" in movie.ImageTags) {
        images.push({"filename": "poster.jpg", "type": "Primary"});
    }
    // 
    // if ("Logo" in movie.ImageTags) {
    //     images.push({"filename": "logo.png", "type": "Logo"});
    // }

    if ("Thumb" in movie.ImageTags) {
        images.push({"filename": "landscape.jpg", "type": "Thumb"});
    }

    if ("BackdropImageTags" in movie && movie.BackdropImageTags.length > 0) {
        images.push({"filename": "fanart.jpg", "type": "Backdrop"});
    }

    return images;
}

exports.getImageUrl = function getImageUrl(movie, image) {
    return `${embyServer}/emby/Items/${movie.Id}/Images/${image}?api_key=${embyApiKey}`;
}

exports.getMovieUrl = function getMovieUrl(movie) {
    return `${embyServer}/emby/Items/${movie.Id}/File?api_key=${embyApiKey}`;
}

exports.getSubtitleUrl = function getSubtitleUrl(movie) {
    return `${embyServer}/emby/Videos/${movie.Id}/${movie.Id}/Subtitles/2/Stream.srt?api_key=${embyApiKey}`;
}

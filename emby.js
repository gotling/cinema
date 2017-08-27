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

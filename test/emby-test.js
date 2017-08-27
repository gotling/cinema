var chai = require('chai');
var expect = chai.expect;
var nock = require('nock');
var config = require('config');

var emby = require('../emby');
var testData = require('./test-data')

describe('Emby', () => {
    beforeEach(function() {
      nock(config.get('emby.server'))
        .get('/Users/' + config.get('emby.user-id') + '/Items?parentId=' + config.get('emby.playlist-id') + '&api_key=' + config.get('emby.api-key'))
        .reply(200, testData.embyPlaylist)
    });

    it('getPlaylist() should return 3 movies', () => {
        return emby.getPlaylist().then((playlist, err) => {
            expect(Array.isArray(playlist)).to.equal(true);
            expect(playlist.length).to.equal(3);
        });
    });

    it('getFavourite() should return The Boss Baby', () => {
        return emby.getPlaylist().then((playlist, err) => {
            var favourite = emby.getFavourite(playlist);
            expect(favourite.name === 'The Boss Baby');
        });
    });

    it('getFavourite() when no favourite should return false', () => {
        return emby.getPlaylist().then((playlist, err) => {
            playlist[1].UserData.favourite = false;
            var favourite = emby.getFavourite(playlist);
            expect(favourite === false);
        });
    });
});

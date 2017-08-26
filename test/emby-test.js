var chai = require('chai');
var expect = chai.expect;
var nock = require('nock');
var config = require('config');

var emby = require('../emby');

describe('Emby', () => {
    beforeEach(function() {
      var playlistResponse = [ { Name: 'Despicable Me 3',
        ServerId: '281dab83203fbd94a69eb181532d094c',
        Id: 'ed93081b858f395fa72544b3a7a79374',
        HasSubtitles: true,
        Container: 'mkv',
        PremiereDate: '2017-06-14T16:00:00.0000000Z',
        CriticRating: 61,
        OfficialRating: 'PG',
        CommunityRating: 6.4,
        RunTimeTicks: 48782090000,
        PlayAccess: 'Full',
        ProductionYear: 2017,
        IsFolder: false,
        Type: 'Movie',
        LocalTrailerCount: 0,
        UserData:
         { PlaybackPositionTicks: 0,
           PlayCount: 0,
           IsFavorite: false,
           Played: false,
           Key: '324852' },
        VideoType: 'VideoFile',
        ImageTags:
         { Primary: 'ac2a8920a4a2ec1425f5c170227d1af9',
           Logo: 'b343d03943c07f7178dcc94964839f54' },
        BackdropImageTags: [ 'd79fe866b694fba61368f086e3b20bae' ],
        LocationType: 'FileSystem',
        MediaType: 'Video' },
        { Name: 'The Boss Baby',
        ServerId: '281dab83203fbd94a69eb181532d094c',
        Id: 'a4ae70c82afac96162f2b1f587f6b45e',
        HasSubtitles: true,
        Container: 'mp4',
        PremiereDate: '2017-03-22T16:00:00.0000000Z',
        CriticRating: 51,
        OfficialRating: 'PG',
        CommunityRating: 6.4,
        RunTimeTicks: 58732000000,
        PlayAccess: 'Full',
        ProductionYear: 2017,
        IsHD: true,
        IsFolder: false,
        Type: 'Movie',
        LocalTrailerCount: 0,
        UserData:
         { PlaybackPositionTicks: 0,
           PlayCount: 0,
           IsFavorite: true,
           Played: false,
           Key: '295693' },
        VideoType: 'VideoFile',
        ImageTags:
         { Primary: 'cb65f4b8e3ab777c68c385b39e17dbd8',
           Logo: '0e8d9b80fddf9639eb5aeb7a3a492400',
           Thumb: '66b51a2ed9f2ba80a99f8a2e3d4cac66' },
        BackdropImageTags: [ 'cfe8c8c0215bdd3171a36e82dbffd92f' ],
        LocationType: 'FileSystem',
        MediaType: 'Video' },
        { Name: 'Moana',
        ServerId: '281dab83203fbd94a69eb181532d094c',
        Id: 'dbd47a6f746fe4f852fa17ad429b9fbf',
        HasSubtitles: true,
        Container: 'mp4',
        PremiereDate: '2016-11-22T16:00:00.0000000Z',
        CriticRating: 96,
        OfficialRating: 'PG',
        CommunityRating: 7.7,
        RunTimeTicks: 64328960000,
        PlayAccess: 'Full',
        ProductionYear: 2016,
        IsHD: true,
        IsFolder: false,
        Type: 'Movie',
        LocalTrailerCount: 0,
        UserData:
         { PlaybackPositionTicks: 0,
           PlayCount: 0,
           IsFavorite: false,
           Played: false,
           Key: '277834' },
        VideoType: 'VideoFile',
        ImageTags:
         { Primary: '819991c83358df3d4244c0ae57707593',
           Logo: '9855efedfd6998b28eb9eef13447e55d',
           Thumb: '689eaecffc2a042b0d09a680483c2c6d' },
        BackdropImageTags: [ '2238d78d7e98364f77d8fe0bee796453' ],
        LocationType: 'FileSystem',
        MediaType: 'Video' }];

      nock(config.get('emby.server'))
        .get('/Users/' + config.get('emby.user-id') + '/Items?parentId=' + config.get('emby.playlist-id') + '&api_key=' + config.get('emby.api-key'))
        .reply(200, playlistResponse)
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

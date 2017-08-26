var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-things'));
var mock = require('mock-fs');
var sync = require('../sync');

const movie = { Name: 'Moana',
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
        MediaType: 'Video' };

describe('Sync', () => {
    before(() => {
        mock({
            '/movies/The Boss Baby (2017)': {
                'The Boss Baby (2017).mkv': '',
                'The Boss Baby (2017).srt': '',
                'Images': {
                    'fanart.jpg': '',
                    'landscape.jpg': '',
                    'logo.png': '',
                    'poster.jpg': ''
                }
            },
            '/movies/Moana (2016)': {
                'Moana (2016).mp4': ''
            }
        });
    });

    after(() => {
        mock.restore();
    });

    it('folderExists("Despicable Me 3") should return false', () => {
        var exists = sync.folderExists('Despicable Me 3 (2017)');
        expect(exists).equals(false);
    });

    it('folderExists("The Boss Baby") should return true', () => {
        var exists = sync.folderExists('The Boss Baby (2017)');
        expect(exists).equals(true);
    });

    it('missingFiles("The Boss Baby") should return empty array', () => {
        var missingFiles = sync.missingFiles("The Boss Baby (2017)");
        expect(Array.isArray(missingFiles)).equals(true);
        expect(missingFiles.length).equals(0);
    });

    it('missingFiles("Moana") should return missing files array', () => {
        var missingFiles = sync.missingFiles("Moana (2016)");

        expect(Array.isArray(missingFiles)).equals(true);
        expect(missingFiles.length).equals(5);
        expect(missingFiles).to.include('subtitle');
        expect(missingFiles).to.include('poster.jpg');
        expect(missingFiles).to.include('fanart.jpg');
        expect(missingFiles).to.include('landscape.jpg');
        expect(missingFiles).to.include('logo.png');
    });

    it('getBaseName("Moana") should return "Moana (2016)"', () => {
        var baseName = sync.getBaseName(movie);
        expect(baseName).equals('Moana (2016)');
    });
});

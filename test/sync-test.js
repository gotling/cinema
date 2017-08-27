var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-things'));
var mock = require('mock-fs');
var sync = require('../sync');
var testData = require('./test-data');

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
        var baseName = sync.getBaseName(testData.embyPlaylist[2]);
        expect(baseName).equals('Moana (2016)');
    });

    it('getExpectedFolders(playlist) should return 3 folders', () => {
        var expectedFolders = sync.getExpectedFolders(testData.embyPlaylist);

        expect(Array.isArray(expectedFolders)).equals(true);
        expect(expectedFolders.length).equals(3);
        expect(expectedFolders).to.include('Despicable Me 3 (2017)');
        expect(expectedFolders).to.include('The Boss Baby (2017)');
        expect(expectedFolders).to.include('Moana (2016)');
    });

    it('getActualFolders() to return "The Boss Baby (2017)" and "Moana (2016)"', () => {
        var actualFolders = sync.getActualFolders();
        expect(Array.isArray(actualFolders)).equals(true);
        expect(actualFolders.length).equals(2);
        expect(actualFolders).to.include('The Boss Baby (2017)');
        expect(actualFolders).to.include('Moana (2016)');
    });

    // it('downloadFile() should fetch file to filesystem', () => {
    //     sync.downloadFile(
    //         'http://emby.lan:8096/web/favicon.ico',
    //         '/tmp/cinema-test-file');
    //
    // });
});

var config = require('config');
var logger = require('winston');
var fs = require('fs');
let spawn = require('child_process').spawn;

var Downloader = require('mt-files-downloader');

logger.level = 'debug';

var emby = require('./emby');
var sync = require('./sync');

// emby.getPlaylist().then((playlist, err) => {
//     console.log(playlist);
//     var favourite = emby.getFavourite(playlist.Items);
//     console.log(favourite);
//     sync.createFolderStructure(favourite);
//     sync.downloadImages(favourite);
//     sync.downloadMovie(favourite);
// });
const url = 'http://director.downloads.raspberrypi.org/raspbian_lite/images/raspbian_lite-2017-08-17/2017-08-16-raspbian-stretch-lite.zip';
const file = '/tmp/test.zip';
const log = '/tmp/dl.log';

const args = [];
args.push('--continue');
args.push('--append-output=' + log);
args.push('--output-document=' + file);
args.push(url);

let wget = spawn('wget', args);

// var FastDownload = require('fast-download');

// const options = {destFile: file};
//
// var dl = new FastDownload(url, options);
// dl.on('error', function(error){throw error;})
// dl.on('start', function(dl){console.log('started');})
// dl.on('end', function(){console.log('ended');});;

// var downloader = new Downloader();
//
// var dl = downloader.resumeDownload(file);
// //var dl = downloader.download(url, file).start();
// dl.on('retry', function(dl) {logger.error(dl)});
//
// require('./_handleEvents')(dl);
// require('./_printStats')(dl);

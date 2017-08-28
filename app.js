const express = require('express');
var bodyParser = require('body-parser');
var Omx = require('node-omxplayer');
const fs = require('fs');
var config = require('config');
var logger = require('winston');

var emby = require('./emby');

logger.add(logger.transports.File, { filename: 'logging.log' });

const movieFolder = config.get('cinema.movie-folder');
const nextMovieFile = "/home/pi/nextMovie.txt";
var fileName = '';
var movies = [];
var player = Omx();

const app = express();
app.use(express.static(__dirname + '/static'));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.sendFile('index.html');
});

app.get('/movies', (req, res) => {
    logger.info("Returning list of available files");
    res.send(movies);
});

app.post('/control', (req, res) => {
  if (player.running) {
    switch(req.body.action) {
      case 'fwd30':
        logger.info("Remote: Forwarding 30 seconds");
        player.fwd30();
        winston
        break;
      case 'fwd600':
        logger.info("Remote: Forwarding 600 seconds");
        player.fwd600();
        break;
      case 'back30':
        logger.info("Remote: Rewinding 30 seconds");
        player.back30();
        break;
      case 'back600':
        logger.info("Remote: Rewinding 600 seconds");
        player.back600();
        break;
      case 'subtitle.toggle':
        logger.info("Remote: Toggle subtitles");
        player.subtitles();
        break;
      case 'subtitle.next':
        logger.info("Remote: Next subtitle");
        player.nextSubtitle();
        break;
      case 'volume.up':
        logger.info("Remote: Volume up");
        player.volUp();
        break;
      case 'volume.down':
        logger.info("Remote: Volume down");
        player.volDown();
        break;
      case 'stop':
        logger.info("Remote: Stop");
        player.quit();
        break;
    }
  }

  switch(req.body.action) {
    case 'play':
      if (!player.running) {
        logger.info("Remote: Starting playback of pre set filename");
        player.newSource(fileName, 'both', true, 0, true);
      } else {
        logger.info("Remote: Pausing/Resuming playback")
        player.play();
      }
      break;
    case 'filename.play':
      fileName = req.body['filename.play'];
      logger.info("Remote: Starting playback of source '%s'", fileName);
      player.newSource(fileName, 'both', true, 0, true);
      break;
    case 'filename.set':
      fileName = req.body['filename.set'];
      logger.info("Remote: Setting filename to '%s'", fileName);
      writeFileNameToDisk(fileName);
      break;
    case 'url.play':
      url = req.body['url.play'];
      logger.info("Remote: Starting playback of source '%s'", fileName);
      player.newSource(url, 'both', true, 0, true);
      break;
  }
  res.redirect('/');
});

app.get('/play', (req, res) => {
    logger.info('Starting playback of pre set filename');
    player.newSource(fileName, 'both', true, 0, true);
    res.redirect('/');
});

app.get('/quit', (req, res) => {
    logger.info("Quiting player");
    player.play();
    player.quit();
    res.sendStatus(200);
});

var server = app.listen(config.get('cinema.port'), () => {
  logger.info('Cinema started. Remote available on port %d', config.get('cinema.port'));
  // emby.getPlaylist().then((playlist, err) => {
  //     if (err) {
  //         console.err(err);
  //     }
  //     console.log(playlist);
  // });
  getMovies();
  readFileNameFromDisk();
});

function getMovies() {
  movies = walkSync(movieFolder);
  logger.info("Found %d available files", movies.length);
}

// List all files in a directory in Node.js recursively in a synchronous fashion
var walkSync = function(dir, filelist) {
  var path = path || require('path');
  var fs = fs || require('fs'),
      files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};

function writeFileNameToDisk(fileName) {
  fs.writeFile(nextMovieFile, fileName, function(err) {
    if (err) {
      logger.warn("Could not write next movie. Error: %s", err);
    } else {
      logger.info("Saved next movie as '%s'", fileName);
    }
  });
}

function readFileNameFromDisk() {
  fs.readFile(nextMovieFile, 'utf8', function (err, data) {
    if (err) {
      logger.warn("Could not read next movie. Error: %s", err);
    } else {
      logger.info("Read next movie. File name: '%s'", data);
      fileName = data;
    }
  });
}

const express = require('express');
var bodyParser = require('body-parser');
var Omx = require('node-omxplayer');
const fs = require('fs');
let spawn = require('child_process').spawn;
var config = require('config');
var logger = require('winston');
const readLastLines = require('read-last-lines');

if (config.get('emby.enabled')) {
  var emby = require('./emby');
}
var playlist = require('./playlist');
var sync = require('./sync');

const logFile = 'logging.log';
logger.add(logger.transports.File, { filename: logFile });

const movieFolder = config.get('cinema.movie-folder');
const nextMovieFile = config.get('cinema.next-movie-file');
const posterFolder = config.get('cinema.poster-folder');
var fileName = '';
var movies = [];
var player = Omx();

const app = express();
app.use(express.static(__dirname + '/static'));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
  res.sendFile('index.html');
});

app.get('/movies', (req, res) => {
    logger.info("Returning list of available files");
    res.send(movies);
});

app.get('/list', (req, res) => {
  logger.info('Listing movies and files');
  res.send(listMovies());
});

app.get('/playlist', (req, res) => {
  logger.info('Returning playlist');
  res.send(playlist.get());
});

app.post('/control/play', (req, res) => {
  if (!player.running) {
    logger.info("Remote: Starting playback of pre set filename");
    player.newSource(fileName, 'both', true, 0, true);
  } else {
    logger.info("Remote: Pausing/Resuming playback")
    player.play();
  }
  res.sendStatus(200);
});

app.post('/control/stop', (req, res) => {
  if (player.running) {
    logger.info("Remote: Stop");
    player.quit();
  }
  res.sendStatus(200);
});

app.post('/control/fwd30', (req, res) => {
  if (player.running) {
    logger.info("Remote: Forwarding 30 seconds");
    player.fwd30();
  }
  res.sendStatus(200);
});

app.post('/control/fwd600', (req, res) => {
  if (player.running) {
    logger.info("Remote: Forwarding 600 seconds");
    player.fwd600();
  }
  res.sendStatus(200);
});

app.post('/control/back30', (req, res) => {
  if (player.running) {
    logger.info("Remote: Rewinding 30 seconds");
    player.back30();
  }
  res.sendStatus(200);
});

app.post('/control/back600', (req, res) => {
  if (player.running) {
    logger.info("Remote: Rewinding 600 seconds");
    player.back600();
  }
  res.sendStatus(200);
});

app.post('/control/subtitle.toggle', (req, res) => {
  if (player.running) {
    logger.info("Remote: Toggle subtitles");
    player.subtitles();
  }
  res.sendStatus(200);
});

app.post('/control/subtitle.next', (req, res) => {
  if (player.running) {
    logger.info("Remote: Next subtitle");
    player.nextSubtitle();
  }
  res.sendStatus(200);
});

app.post('/control/volume.up', (req, res) => {
  if (player.running) {
    logger.info("Remote: Volume up");
    player.volUp();
  }
  res.sendStatus(200);
});

app.post('/control/volume.down', (req, res) => {
  if (player.running) {
    logger.info("Remote: Volume down");
    player.volDown();
  }
  res.sendStatus(200);
});

app.post('/control/play.movie', (req, res) => {
  let movie = url = req.body['name'];
  fileName = movie;
  if (!player.running) {
    logger.info("Remote: Starting playback of pre set filename");
    player.newSource(fileName, 'both', true, 0, true);
  } else {
    logger.info("Remote: Pausing/Resuming playback")
    player.play();
  }
  res.sendStatus(200);
});

app.post('/control', (req, res) => {
  if (player.running) {
    switch(req.body.action) {
      case 'fwd30':
        logger.info("Remote: Forwarding 30 seconds");
        player.fwd30();
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

app.post('/play-now', (req, res) => {
  let movie = req.body;
  let movieFilePath = playlist.getMovieFilePath(movie);
  logger.info("Starting playback now of movie", movieFilePath);
  player.newSource(movieFilePath, 'both', true, 0, true);
  res.sendStatus(200);
});

app.get('/quit', (req, res) => {
    logger.info("Quiting player");
    player.play();
    player.quit();
    res.sendStatus(200);
});

app.get('/log', (req, res) => {
    res.setHeader("content-type", "text/plain");
    readLastLines.read(logFile, 20).then((lines) => {
        res.send(lines);
    });
});

app.get('/init', (req, res) => {
  playlist.makeFromAll();
  res.sendStatus(200);
});

function downloadAndSetMovie() {
    logger.info("Download and set favourite movie");
    emby.getPlaylist().then((playlist, err) => {
        let favourite = emby.getFavourite(playlist.Items);
        sync.downloadMovieFiles(favourite).then((err) => {
            logger.info("All files downloaded");
            let filePath = sync.getMovieFilePath(favourite);
            setAndSaveNextMovie(filePath);
            setFbiImageFolder(favourite);
        });
    });
}

function setFbiImageFolder(movie) {
    let imagePath = sync.getMovieImagePath(movie);
    logger.info("Updating poster folder to '%s'", imagePath);
    if (sync.fileExists(config.get("cinema.poster-folder"))) {
        fs.unlinkSync(config.get("cinema.poster-folder"));
    }
    fs.symlinkSync(imagePath, config.get("cinema.poster-folder"));

    // Kill fbi to have it reread images
    logger.info("Killing fbi process");
    spawn('killall', ['fbi', '--signal', 'QUIT']);
}

function reboot() {
    logger.info("Rebooting machine");
    require('child_process').exec('reboot', (msg) => { logger.info(msg) });
}

var server = app.listen(config.get('cinema.port'), () => {
  logger.info('Cinema started. Remote available on port %d', config.get('cinema.port'));

  getMovies();
  //readFileNameFromDisk();
  playlist.read().then(result => {
    playlist.updatePlaylist();
  }).catch(err => {
    console.log('Could not read playlist', err);
  });

  if (config.get('emby.enabled')) {
    downloadAndSetMovie();
  }
});

function setAndSaveNextMovie(filePath) {
    logger.info("Setting filename to '%s'", filePath);
    fileName = filePath;
    writeFileNameToDisk(fileName);
}

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

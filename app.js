const express = require('express');
var bodyParser = require('body-parser');
var keypress = require('keypress');
var Omx = require('node-omxplayer');
const fs = require('fs');

let spawn = require('child_process').spawn;
const { exec } = require('child_process');

//require('node-define');
//var ApiClient = require('./static/emby.apiclient');

const movieFolder = '/movies/';
var movie = 'Storks (2016)/Storks.2016.mkv';
var fileName = movieFolder + movie;
var movies = [];
var player = Omx();

const app = express();
app.use(express.static(__dirname + '/static'));
app.use(bodyParser.urlencoded({extended: true}));

keypress(process.stdin);

app.get('/', (req, res) => {
  res.sendFile('index.html');
});

app.get('/movies', (req, res) => {
  res.send(movies);
});

app.post('/control', (req, res) => {
  if (player.running) {
    switch(req.body.action) {
      case 'fwd30':
        player.fwd30();
        break;
      case 'fwd600':
        player.fwd600();
        break;
      case 'back30':
        player.back30();
        break;
      case 'back600':
        player.back600();
        break;
      case 'subtitle.toggle':
        player.subtitles();
        break;
      case 'subtitle.next':
        player.nextSubtitle();
        break;
      case 'volume.up':
        player.volUp();
        break;
      case 'volume.down':
        player.volDown();
        break;
      case 'stop':
        player.quit();
        break;
    }
  }

  switch(req.body.action) {
    case 'play':
      if (!player.running) {
        player.newSource(fileName, 'both', true, 0, true);
      } else {
        player.play();
      }
      break;
    case 'filename.play':
      fileName = req.body['filename.play'];
      player.newSource(fileName, 'both', true, 0, true);
      break;
    case 'filename.set':
      fileName = req.body['filename.set'];
      writeFileNameToDisk(fileName);
      break;
    case 'url.play':
      url = req.body['url.play'];
      player.newSource(url, 'both', true, 0, true);
      break;
  }
  res.redirect('/');
});

app.get('/play', (req, res) => {
  player.newSource(fileName, 'both', true, 0, true);
  res.redirect('/');
});

app.get('/quit', (req, res) => {
  player.play();
  player.quit();
  res.sendStatus(200);
});

var server = app.listen(3000, () => {
  console.log('CINEMA STARTED');
  getMovies();
  readFileNameFromDisk();
  //showImage('/home/pi/poster.jpg');
});

function getMovies() {
  movies = walkSync(movieFolder);
  console.log(movies);
}

// Handle keyboard input
process.stdin.on('keypress', function (ch, key) {
  console.log(key);

  if (key.ctrl && key.name == 'c') {
    if (player.running) {
      player.quit();
    }
    server.close();
    process.stdin.pause();
  }

  if (player.running && key) {
    if ((key.name == 'q') || (key.ctrl && key.name == 'c')) {
      player.quit();
      process.stdin.pause();
      server.close();
    } else if (key.name == 'space') {
      player.play();
    } else if (key.name == 'left') {
      player.back30();
    } else if (key.name == 'right') {
      player.fwd30();
    } else if (key.name == 'up') {
      player.fwd600();
    } else if (key.name == 'down') {
      player.back600();
    } else {
      player.passThroughKey(key.name);
    }
  }
});

//process.stdin.setRawMode(true);
process.stdin.resume();

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

function showImage(fileName) {
  let args = ['-d', '/dev/fb0', '--once', '--noverbose', '--autozoom'];
  args.push(fileName);
  //console.log('args for fbi:', args);
  //var fbiProcess = spawn('/usr/bin/fbi', args);
  let command = '/usr/bin/fbi -T 2 ' + args.join(' ');
  console.log('exec command: ' + command);
  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }

    console.log(`Number of files ${stdout}`);
  });
}

function writeFileNameToDisk(fileName) {
  fs.writeFile("/home/pi/nextMovie.txt", fileName, function(err) {
    console.log('WRITE');
    if (err) {
      return console.log(err);
    } else {
      console.log("Next movie saved to file");
    }
  });
}

function readFileNameFromDisk() {
  fs.readFile('/home/pi/nextMovie.txt', 'utf8', function (err, data) {
    console.log('READ');
    if (err) {
      return console.log(err);
    } else {
      console.log('Next movie read from file: ' + data);
      fileName = data;
    }
  });
}

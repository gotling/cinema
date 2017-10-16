var config = require('config');
var fs = require('fs');
var logger = require('winston');
var path = require('path');

var playlist = []

exports.get = function get() {
  return playlist;
}

exports.read = function read() {
  return new Promise((resolve, reject) => {
    fs.readFile(config.get('cinema.playlist-file'), 'utf8', function (err, data) {
      if (err) {
        logger.warn("Could not read playlist. Error: %s", err);
        reject();
      } else {
        playlist = JSON.parse(data);
        logger.info("Read playlist: '%s'", playlist);
        resolve(playlist);
      }
    });
  });
}

exports.write = function write(data) {
  var json = JSON.stringify(data);
  fs.writeFile(config.get('cinema.playlist-file'), json, function(err) {
    if (err) {
      logger.warn("Could not write playlist. Error: %s", err);
    } else {
      logger.info("Saved playlist");
    }
  });
}

exports.makeFromAll = function makeFromAll() {
  playlist = listMovies();
  addDate();
  exports.write(playlist);
}

function addDate() {
  var date = new Date();
  for (let item of playlist) {
    item['date'] = date.toISOString().substr(0, 10);
    date.setDate(date.getDate() + 1);
  }
}

function listMovies() {
  let movieFolder = config.get('cinema.movie-folder');
  var files = fs.readdirSync(movieFolder);
  let movies = [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(movieFolder, file)).isDirectory()) {
      let fileList = walkSync(path.join(movieFolder, file), []);
      movies.push({'name': file, 'files': fileList});
    }
  });
  return movies;
}

// List all files in a directory in Node.js recursively in a synchronous fashion
var walkSync = function(dir, filelist) {
  var files = fs.readdirSync(dir);
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

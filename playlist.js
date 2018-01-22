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

exports.write = function write() {
  var json = JSON.stringify(playlist);
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
  exports.addDate();
  exports.write();
}

exports.updatePlaylist = function updatePlaylist() {
  updateOrderAndDate();
  exports.write();
}

exports.getMovieFilePath = function getMovieFilePath(movie) {
  const movieExtensions = ['mp4', 'mkv', 'avi'];
  for (let file of movie['files']) {
    for (let extension of movieExtensions) {
      if (file.endsWith(extension)) {
        return file;
      }
    }
  }
}

/* Find playlist entries whose date has already passed.
    Update date and put them last in list
  */
function updateOrderAndDate() {
  let date = new Date();
  date.setHours(0, 0, 0, 0);
  let lastDate = new Date(playlist[playlist.length - 1]['date']);
  let offset = 1;
  let newList = playlist.slice();

  // All dates in playlist already passed
  if (lastDate < date) {
    lastDate = new Date();
    offset = 0;
  }

  for (let item of playlist) {
    if (date > new Date(item['date'])) {
      let putLast = newList.splice(0, 1)[0];
      lastDate.setDate(lastDate.getDate() + offset);
      putLast['date'] = lastDate.toISOString().substr(0, 10);
      newList.push(putLast);
      offset++;
    }
  }
  playlist = newList;
  logger.info('Updated date and order');
}

exports.addDate = function addDate() {
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

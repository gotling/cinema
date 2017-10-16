define('accordion',['exports', 'aurelia-framework', 'cinema-service', 'bootstrap'], function (exports, _aureliaFramework, _cinemaService) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Accordion = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  var Accordion = exports.Accordion = (_dec = (0, _aureliaFramework.inject)(_cinemaService.CinemaService), _dec(_class = function () {
    function Accordion(service) {
      var _this = this;

      _classCallCheck(this, Accordion);

      this.service = service;
      this.service.getPlaylist().then(function (movies) {
        _this.movies = movies;
      });
    }

    Accordion.prototype.playNow = function playNow(movie) {
      this.service.playNow(movie);
    };

    Accordion.prototype.getImageUrl = function getImageUrl(movie) {};

    return Accordion;
  }()) || _class);
});
define('app',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var App = exports.App = function () {
    function App() {
      _classCallCheck(this, App);

      this.message = 'Cinema App';
    }

    App.prototype.configureRouter = function configureRouter(config, router) {
      config.options.pushState = true;
      config.options.root = '/';
      config.options.hashChange = false;

      config.map([{ route: [''], name: 'home', moduleId: 'cinema', nav: true, title: 'Cinema' }]);
      this.router = router;
    };

    return App;
  }();
});
define('cinema-service',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var baseUrl = 'http://cinema.lan/';

  var CinemaService = exports.CinemaService = function () {
    function CinemaService() {
      _classCallCheck(this, CinemaService);
    }

    CinemaService.prototype.getMovies = function getMovies() {
      return get('list');
    };

    CinemaService.prototype.getPlaylist = function getPlaylist() {
      return get('playlist');
    };

    CinemaService.prototype.play = function play() {
      return post('control/play');
    };

    CinemaService.prototype.playNow = function playNow(movie) {
      return post('play-now', movie);
    };

    CinemaService.prototype.stop = function stop() {
      return post('control/stop');
    };

    CinemaService.prototype.fwd30 = function fwd30() {
      return post('control/fwd30');
    };

    CinemaService.prototype.fwd600 = function fwd600() {
      return post('control/fwd600');
    };

    CinemaService.prototype.back30 = function back30() {
      return post('control/back30');
    };

    CinemaService.prototype.back600 = function back600() {
      return post('control/back600');
    };

    CinemaService.prototype.subtitleToggle = function subtitleToggle() {
      return post('control/subtitle.toggle');
    };

    CinemaService.prototype.subtitleNext = function subtitleNext() {
      return post('control/subtitle.next');
    };

    CinemaService.prototype.volumeUp = function volumeUp() {
      return post('control/volume.up');
    };

    CinemaService.prototype.volumeDown = function volumeDown() {
      return post('control/volume.down');
    };

    return CinemaService;
  }();

  function get(path) {
    var init = {
      method: 'GET',
      mode: 'cors'
    };

    return fetch(baseUrl + path, init).then(function (response) {
      return response.json();
    }).then(function (result) {
      return result;
    });
  }

  function post(path) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    var init = {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      }
    };

    console.log(data);

    if (data) {
      init['body'] = JSON.stringify(data);
    }

    return fetch(baseUrl + path, init);
  }
});
define('cinema',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var Cinema = exports.Cinema = function Cinema() {
    _classCallCheck(this, Cinema);
  };
});
define('environment',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    debug: true,
    testing: true
  };
});
define('main',['exports', './environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;

  var _environment2 = _interopRequireDefault(_environment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function configure(aurelia) {
    aurelia.use.standardConfiguration().feature('resources');

    if (_environment2.default.debug) {
      aurelia.use.developmentLogging();
    }

    if (_environment2.default.testing) {
      aurelia.use.plugin('aurelia-testing');
    }

    aurelia.start().then(function () {
      return aurelia.setRoot();
    });
  }
});
define('remote',['exports', 'aurelia-framework', './cinema-service'], function (exports, _aureliaFramework, _cinemaService) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Remote = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  var Remote = exports.Remote = (_dec = (0, _aureliaFramework.inject)(_cinemaService.CinemaService), _dec(_class = function () {
    function Remote(service) {
      _classCallCheck(this, Remote);

      this.service = service;
    }

    Remote.prototype.play = function play() {
      this.service.play();
    };

    Remote.prototype.stop = function stop() {
      this.service.stop();
    };

    Remote.prototype.fwd30 = function fwd30() {
      this.service.fwd30();
    };

    Remote.prototype.fwd600 = function fwd600() {
      this.service.fwd600();
    };

    Remote.prototype.back30 = function back30() {
      this.service.back30();
    };

    Remote.prototype.back600 = function back600() {
      this.service.back600();
    };

    Remote.prototype.subtitleToggle = function subtitleToggle() {
      this.service.subtitleToggle();
    };

    Remote.prototype.subtitleNext = function subtitleNext() {
      this.service.subtitleNext();
    };

    Remote.prototype.volumeUp = function volumeUp() {
      this.service.volumeUp();
    };

    Remote.prototype.volumeDown = function volumeDown() {
      this.service.volumeDown();
    };

    return Remote;
  }()) || _class);
});
define('resources/index',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  function configure(config) {}
});
define('text!accordion.html', ['module'], function(module) { module.exports = "<template><require from=\"bootstrap/css/bootstrap.css\"></require><div class=\"panel-group mt-4\" id=\"accordion\" role=\"tablist\" aria-multiselectable=\"true\"><div class=\"panel panel-default\" repeat.for=\"movie of movies\"><div class=\"panel-heading\" role=\"tab\" id=\"heading-${$index}\"><h4 class=\"panel-title\"> ${movie.date}&nbsp; <a role=\"button\" data-toggle=\"collapse\" data-parent=\"#accordion\" href=\"#collapse-${$index}\" aria-expanded=\"true\" aria-controls=\"collapse-${$index}\"> ${movie.name} </a></h4></div><div id=\"collapse-${$index}\" class=\"panel-collapse ${ !item.UserData.IsFavorite ? 'collapse' : '' } ${$first && 'in'}\" role=\"tabpanel\" aria-labelledby=\"heading-${index}\"><div class=\"panel-body\"><button click.delegate=\"playNow(movie)\" class=\"btn\">Play now</button></div></div></div></div></template>"; });
define('text!css/movie-table.css', ['module'], function(module) { module.exports = "img {\n    max-width: 133px;\n}\n"; });
define('text!app.html', ['module'], function(module) { module.exports = "<template><require from=\"bootstrap/css/bootstrap.css\"></require><div class=\"container\"><h1>${message}</h1><router-view></router-view></div></template>"; });
define('text!cinema.html', ['module'], function(module) { module.exports = "<template><require from=\"remote\"></require><require from=\"accordion\"></require><remote></remote><accordion></accordion></template>"; });
define('text!remote.html', ['module'], function(module) { module.exports = "<template><require from=\"bootstrap/css/bootstrap.css\"></require><div class=\"row\"><div class=\"btn-group btn-group-lg col-12\" role=\"group\" aria-label=\"Playback\"><button click.delegate=\"play()\" type=\"button\" class=\"btn btn-primary\">Play / Pause</button> <button click.delegate=\"stop()\" type=\"button\" class=\"btn btn-danger\">Stop</button></div><div class=\"btn-group col-12 pt-4\" role=\"group\" aria-label=\"Volume\"><button click.delegate=\"volumeDown()\" type=\"button\" class=\"btn btn-secondary\">- Volume</button> <button click.delegate=\"volumeUp()\" type=\"button\" class=\"btn btn-secondary\">+ Volume</button></div><div class=\"btn-group col-12 pt-2\" role=\"group\" aria-label=\"Playback Position\"><button click.delegate=\"back600()\" type=\"button\" class=\"btn btn-secondary\">&lt;&lt; 10 min</button> <button click.delegate=\"back30()\" type=\"button\" class=\"btn btn-secondary\">&lt; 30 sec</button> <button click.delegate=\"fwd30()\" type=\"button\" class=\"btn btn-secondary\">&gt; 30 sec</button> <button click.delegate=\"fwd600()\" type=\"button\" class=\"btn btn-secondary\">&gt;&gt; 10 min</button></div><div class=\"btn-group col-12 pt-2\" role=\"group\" aria-label=\"Subtitle\"><button click.delegate=\"subtitleToggle()\" type=\"button\" class=\"btn btn-secondary\">Toggle Subtitle</button> <button click.delegate=\"subtitleNext()\" type=\"button\" class=\"btn btn-secondary\">Next Subtitle</button></div></div></template>"; });
//# sourceMappingURL=app-bundle.js.map
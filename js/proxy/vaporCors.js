var good = require('good');
var Hapi = require('hapi');
var goodConsole = require('good-console');

var loggerOptions = {
  opsInterval: 1000,
  reporters: [{
    reporter: goodConsole,
    events: {
      log: '*',
      request: '*',
      response: '*'
    }
  }]
};

var addCorsHeaders  = function(request, reply) {
  var allowedHeaders = [
    'authorization',
    'content-length',
    'content-type',
    'if-match',
    'if-none-match',
    'origin',
    'x-requested-with'
  ];

  function addAllowedHeaders (arr) {
    for (var i = 0; i < arr.length; i++) {
      if (allowedHeaders.indexOf(arr[i].trim().toLowerCase()) === -1) {
        allowedHeaders.push(arr[i].trim().toLowerCase());
      }
    }
  }
  addAllowedHeaders(Object.keys(request.headers));

  // depending on whether we have a boom or not,
  // headers need to be set differently.
  var response = request.response.isBoom ? request.response.output : request.response;

  if (request.method === 'options') {
    response.statusCode = 200;
    if (request.headers['Allow-Control-Request-Headers']) {
      addAllowedHeaders(
        request.headers['Allow-Control-Request-Headers'].split(',')
      );
    }
  }

  response.headers['access-control-allow-origin'] = request.headers.origin;
  response.headers['access-control-allow-headers'] = allowedHeaders.join(', ');
  response.headers['access-control-expose-headers'] = 'content-type, content-length, etag';
  response.headers['access-control-allow-methods'] = 'GET, PUT, POST, DELETE';
  response.headers['access-control-allow-credentials'] = 'true';

  reply.continue();
};

var corsPlugin = function(server, options, next) {
  server.ext('onPreResponse', addCorsHeaders);
  next();
};

corsPlugin.attributes = {
  pkg: {
    "name": "corsproxy",
    "description": "standalone CORS proxy",
    "version": "1.0.0",
    "main": "./index.js",
    "author": {
      "name": "Gregor Martynus",
      "email": "gregor@martynus.net"
    },
    "dependencies": {
      "good": "^6.1.2",
      "good-console": "^5.0.0",
      "hapi": "^8.4.0",
      "http-proxy": "~0.10"
    },
    "bin": {
      "corsproxy": "./bin/corsproxy"
    },
    "scripts": {
      "start": "./bin/corsproxy",
      "test": "standard"
    },
    "repository": {
      "type": "git",
      "url": "https://github.com/gr2m/CORS-Proxy"
    },
    "engines": {
      "node": "0.10.x"
    },
    "devDependencies": {
      "standard": "^3.7.2"
    },
    "license": "MIT"
  }
};

var server = new Hapi.Server({});
var port = parseInt(process.env.CORSPROXY_PORT || process.env.PORT || 1337, 10);

server.connection({
  port: port
});

// cors plugin
server.register(corsPlugin, function (error) {
  if (error) server.log('error', error)
});

// logger plugin
server.register({
  register: good,
  options: loggerOptions
}, function (error) {
  if (error) server.log('error', error)
});

// proxy route
server.route({
  method: '*',
  path: '/{host}/{path*}',
  handler: {
    proxy: {
      passThrough: true,
      mapUri: function(request, callback) {
        request.host = request.params.host
        request.path = request.path.substr(request.params.host.length + 1)
        console.log('proxy to http://' + request.host + request.path)
        callback(null, 'http://' + request.host + request.path, request.headers);
      }
    }
  }
});


server.start(function (error) {
  if (error) server.log('error', error)

  server.log('info', 'CORS Proxy running at:' + server.info.uri);
});
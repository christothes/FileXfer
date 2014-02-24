/**
 * Created by chriss on 2/16/14.
 */
'use strict';
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var azure = require('azure');
var sys = require('sys');

var app = express();

app.use(function(req, res, next) {
  if(req.method === 'PUT'){
    //only set all this up if it is a PUT with content
    var buffLen =  parseInt(req.headers['content-length'], 10);
    var data = new Buffer(buffLen);
    var bytesWritten = 0;
    //req.setEncoding('utf8');
    req.on('data', function(chunk) {
      var len = chunk.length;
      var i = 0;
      for(;i < len; i += 1){
        try{
          data.writeUInt8(chunk[i], i + bytesWritten);
        } catch(e) {
          console.log(e);
          break;
        }
      }
      bytesWritten += len;
      //data += chunk;
    });
    req.on('end', function() {
      req.rawBody = data;
      next();
    });
  } else{
    req.on('data', function(chunk) {

    });
    req.on('end', function() {
      next();
    });
  }
});
// all environments
app.set('port', process.env.PORT || 3000);
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
//app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/getSAS/*', routes.getSAS);
app.put('/proxy', routes.proxy);
app.get('/dlfile', routes.getBlob);
app.get('/js/*', routes.js);
app.get('/lib/*', routes.lib);
app.get('/css/*', routes.css);
app.get('/partials/*', routes.partials);
app.get('/fonts/*', routes.fonts);
//app.get('/Content', routes.content);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
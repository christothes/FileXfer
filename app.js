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

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/getSAS/*', routes.getSAS);
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
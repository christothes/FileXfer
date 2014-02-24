/**
 * Created by chriss on 2/16/14.
 */
'use strict'
/*
 * GET home page.
 */
var azure = require('azure');
var util = require('util');
var fs = require('fs');
var request = require('request');

//request.defaults({'proxy':'http://127.0.0.1:8888'})
//
// Create a proxy server with custom application logic
//
//var proxy = httpProxy.createProxyServer({});

var s4 = function() {
  return Math.floor(Math.random() * 0x10000).toString();
}
var guid = function(){
  return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
};

var getSasUrl = function(containerName, blobName) {

  var blobService = azure.createBlobService('diagpoc', 'ePQIQtVAA2X1dMKeR7Pui0e8iN//RGuCvesFp7JVwEqdbxKrhf9ChNfiB3gBnk37nufPSGXEv+qy6lgTaSOrIQ==')
  //create a SAS that expires in an hour
  var sharedAccessPolicy = {
    AccessPolicy: {
      Expiry: azure.date.minutesFromNow(60),
      Permissions: 'rw'
    }
  };

  blobService.createBlockBlobFromText(containerName, blobName, "init", function(error){
    if(error){
      console.log(error);
      //res.json(error);
    }
  });
  console.log('created blobName: ' + blobName);

  var sasUrl = blobService.getBlobUrl(containerName, blobName, sharedAccessPolicy);
  blobService.getContain
  console.log(sasUrl);
  return sasUrl;
}

exports.index = function (req, res) {
  res.sendfile('./app/index.html');
  //res.render('index', { title: 'Express' });
};

exports.partials = function (req, res) {
  console.log('getting partials: ' + req.originalUrl);
  if (req.params.length === 1) {
    res.sendfile('./app/partials/' + req.params[0]);
  }
};

exports.proxy = function (req, res) {
  //fixup request
  var url = req.headers['full-url'];
  console.log('proxy to: ' + url);
  var contLen = req.headers['content-length'];
  //copy relevant headers
  var headers = {
    'x-ms-date': req.headers['x-ms-date'],
    'x-ms-version': req.headers['x-ms-version'],
    'Content-Length': contLen
  }

  if(req.headers['x-ms-meta-filename']){
    headers['x-ms-meta-filename'] = req.headers['x-ms-meta-filename'];
  }

  console.log('body length: ' + req.rawBody.length);
  request.put({url: url, headers: headers, body: req.rawBody}).pipe(res);
}

exports.getSAS = function (req, res) {
  console.log('getting SAS');
  var sasUrl = getSasUrl('test2', guid());


  res.json({url: sasUrl, blobSize: '0'});

};

exports.getBlob = function (req, res) {
  console.log('getBlob');
  var blobService = azure.createBlobService('diagpoc', 'ePQIQtVAA2X1dMKeR7Pui0e8iN//RGuCvesFp7JVwEqdbxKrhf9ChNfiB3gBnk37nufPSGXEv+qy6lgTaSOrIQ==')
  var containerName = 'test2';
  var blobName = 'FileBlob';

  blobService.getBlobToFile(containerName, blobName, 'c:\\users\\chriss\\downloads\\test.msi', function(error){
    if(error){
      console.log(error);
    } else {
      console.log("finished download");
    }
  });
  res.json({response: 'request sent'});
}

exports.js = function (req, res) {
  console.log('getting js: ' + req.originalUrl);
  if (req.params.length === 1) {
    res.sendfile('./app/js/' + req.params[0]);
  }
};

exports.lib = function (req, res) {
  console.log('getting libs: ' + req.originalUrl);
  if (req.params.length === 1) {
    res.sendfile('./app/lib/' + req.params[0]);
  }
};

exports.css = function (req, res) {
  console.log('getting css: ' + req.originalUrl);
  if (req.params.length === 1) {
    res.sendfile('./app/css/' + req.params[0]);
  }
};

exports.fonts = function (req, res) {
  console.log('getting fonts: ' + req.originalUrl);
  if (req.params.length === 1) {
    res.sendfile('./fonts/' + req.params[0]);
  }
};
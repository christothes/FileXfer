/**
 * Created by chriss on 2/16/14.
 */
'use strict'
/*
 * GET home page.
 */
var azure = require('azure');

var s4 = function() {
  return Math.floor(Math.random() * 0x10000).toString();
}
var guid = function(){
  return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
};

exports.index = function (req, res) {
  res.sendfile('./app/index.html');
  //res.render('index', { title: 'Express' });
};

// Get Partials

exports.partials = function (req, res) {
  console.log('getting partials: ' + req.originalUrl);
  if (req.params.length === 1) {
    res.sendfile('./app/partials/' + req.params[0]);
  }
};

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

exports.getSAS = function (req, res) {
  console.log('getting SAS');

  var blobService = azure.createBlobService('diagpoc', 'ePQIQtVAA2X1dMKeR7Pui0e8iN//RGuCvesFp7JVwEqdbxKrhf9ChNfiB3gBnk37nufPSGXEv+qy6lgTaSOrIQ==')
  var containerName = 'test';
  var blobName = 'customerB';

//create a SAS that expires in an hour
  var sharedAccessPolicy = {
    AccessPolicy: {
      Expiry: azure.date.minutesFromNow(60),
      Permissions: 'rw'
    }
  };

  blobService.createBlockBlobFromText(containerName, blobName, 'init', function(error){
    if(error){
      console.log(error);
      res.json(error);
    }
  });

  var sasUrl = blobService.getBlobUrl(containerName, blobName, sharedAccessPolicy);
  blobService.getContain
  console.log(sasUrl);
  res.json({url: sasUrl});

};
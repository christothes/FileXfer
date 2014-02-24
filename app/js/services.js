'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
  value('version', '0.1')
  .factory("AES", function() {

  })
  .factory("FileXfer", function($http, $q) {
    var devStorage = false;
    var sessions = {};

    var XHR = {
      setHeaders: function(req, config) {
        //req.setRequestHeader('x-ms-date',  new Date().toGMTString().replace('UTC', 'GMT'));
        req.setRequestHeader('x-ms-version', '2013-08-15');
        if(config && config.headers) {
          for (var h in config.headers) {
            req.setRequestHeader(h, config.headers[h]);
          }
        }
      },
      setCommonEvents: function(req, def, config) {
        req.onreadystatechange = function() {
          if(req.readyState === 4) {
            if(req.status === 200 || req.status === 201){
              def.resolve({responseText: req.responseText, responseHeaders: req.getAllResponseHeaders(), config: config});
            } else {
              def.reject(req.responseText)
            }
          }
        }
      },
      get: function(url, config) {
        var def = $q.defer();
        var req = new XMLHttpRequest();
        req.open('GET', url, true);
        this.setHeaders(req, config);
        this.setCommonEvents(req, def, config);
        req.send();
        return def.promise;
      },
      put: function(url, data, config) {
        var def = $q.defer();
        var req = new XMLHttpRequest();
        req.open('PUT', url, true);
        req.setRequestHeader('x-ms-date', new Date().toGMTString().replace('UTC', 'GMT'));
        this.setHeaders(req, config);
        this.setCommonEvents(req, def, config);
        req.upload.onprogress = function(evt) {
          if (evt.lengthComputable) {
            var session = sessions[config.headers.sas];
            if(session){
              session.bytesTransferred += evt.loaded - session.previousBytes;
              var totalLoaded = session.bytesTransferred;
              if(evt.loaded === evt.total) {
                session.previousBytes = 0;
                session.totalKbPerSec = Math.floor((totalLoaded / 1024) / ((Date.now() - session.startTime) / 1000));
              } else{
                session.previousBytes = evt.loaded;
              }
              //only calculate when chunk completes
              var totalSize = session.fileSize;
              var totalPercent = Math.floor(100 * totalLoaded / totalSize);
              //var totalKbPerSec = Math.floor((totalLoaded / 1024) / ((Date.now() - session.startTime) / 1000))
              def.notify({progress: totalPercent, bitRate: session.totalKbPerSec});

              if(totalPercent === 100) {
                delete sessions[config.headers.sas];
              }
            }
//            var percent = Math.floor(100 * evt.loaded / evt.total);
//            var kbPerSecond =  Math.floor((evt.loaded / 1024) / ((Date.now() - startTime) / 1000))
//            def.notify({progress: percent, bitRate: kbPerSecond});
          }
        }
        req.send(data);
        return def.promise;
      }
    }
    function zeroPad(num, numZeros) {
      var n = Math.abs(num);
      var zeros = Math.max(0, numZeros - Math.floor(n).toString().length );
      var zeroString = Math.pow(10,zeros).toString().substr(1);
      if( num < 0 ) {
        zeroString = '-' + zeroString;
      }

      return zeroString+n;
    };
    var buildBlockListBody = function(count) {
      var i = 1;
      var body = '<?xml version="1.0" encoding="utf-8"?><BlockList>';
      for(;i <= count; i+= 1){
        body = body +'<Latest>' + zeroPad(i, 4) +'</Latest>';
      }
      body = body +'</BlockList>'
      return body;
    }
    return {
      getSASToken: function(fileName) {
        return $http.get('/getsas/' + fileName);
      },
      downloadFile: function() {
        return $http.get('/dlfile');
      },
      getContainers: function(server) {
        var url = server + (devStorage ? 'devstoreaccount1?comp=list' : '&comp=list' /*+ '&include=metadata' */);
        return doCall(url);
      },
      getBlobMetaData: function(server) {
        var url = server + (devStorage ? 'devstoreaccount1?comp=list' : '&comp=metadata');
        return doCall('GET', url);
      },
      getBlobProperties: function(server) {
        var url = server + (devStorage ? 'devstoreaccount1?comp=list' : '');
        //return doCall('HEAD', url);
        return XHR.get(url, {
          headers: {
            'x-ms-date': new Date().toGMTString().replace('UTC', 'GMT')}
        });

//        return $http.get(url, {
//          headers: {
//            'x-ms-date': new Date().toGMTString().replace('UTC', 'GMT')}
//        });
      },
      putFileInBlob: function(server, data, blockId, useProxy) {
        var url = server + '&comp=block&blockid=' + zeroPad(blockId, 4);
        if(!sessions[url]){

        }
        return XHR.put(useProxy ? '/proxy' : url, data, {
          headers: {
            'x-ms-date': new Date().toGMTString().replace('UTC', 'GMT'),
            'sas': server,
            'full-url': url
          }
        });
      },
      createSessionData: function(sasURL, fileSize) {
        //this is used to track total download progress and speed
        sessions[sasURL] = {fileSize: fileSize, bytesTransferred: 0, previousBytes: 0, startTime: Date.now()}
      },
      putFileInPageBlob: function(server, data, range) {
        var url = server + '&comp=page';
        return XHR.put(url, data, {
          headers: {
            'x-ms-range': 'bytes=' + range,
            'x-ms-page-write': 'update'
          }
        });
      },
      commitBlocks: function(server, blockCount, fileName, useProxy) {
        console.log('commitBlocks. BlockCount= ' + blockCount);
        var url = server + '&comp=blocklist';
        var data = buildBlockListBody(blockCount);
        return XHR.put(useProxy ? '/proxy' : url, data, {
          headers: {
            'x-ms-date': new Date().toGMTString().replace('UTC', 'GMT'),
            'x-ms-meta-filename': fileName,
            'full-url': url
          }
        });
//        return $http.put(url, data, {
//          headers: {
//            'x-ms-date': new Date().toGMTString().replace('UTC', 'GMT')
//          }
//        });
      }
    }
  })
  .factory("AzureReqIntercept", function(Base64) {
    return {
      // optional method
      'request': function(config) {
        //fixup the headers
        //config.headers['x-ms-date'] = "1234";
        //config.headers['Access-Control-Allow-Origin'] = '*';
        console.log(config);
        return config;
      }
    }
  });



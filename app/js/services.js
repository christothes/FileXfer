'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
  value('version', '0.1')
  .factory("Base64", function() {
    /*
     * Original code (c) 2010 Nick Galbreath
     * http://code.google.com/p/stringencoders/source/browse/#svn/trunk/javascript
     *
     * jQuery port (c) 2010 Carlo Zottmann
     * http://github.com/carlo/jquery-base64
     *
     * Permission is hereby granted, free of charge, to any person
     * obtaining a copy of this software and associated documentation
     * files (the "Software"), to deal in the Software without
     * restriction, including without limitation the rights to use,
     * copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the
     * Software is furnished to do so, subject to the following
     * conditions:
     *
     * The above copyright notice and this permission notice shall be
     * included in all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
     * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
     * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
     * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
     * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
     * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
     * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
     * OTHER DEALINGS IN THE SOFTWARE.
     */

    /* base64 encode/decode compatible with window.btoa/atob
     *
     * window.atob/btoa is a Firefox extension to convert binary data (the "b")
     * to base64 (ascii, the "a").
     *
     * It is also found in Safari and Chrome.  It is not available in IE.
     *
     * if (!window.btoa) window.btoa = $.base64.encode
     * if (!window.atob) window.atob = $.base64.decode
     *
     * The original spec's for atob/btoa are a bit lacking
     * https://developer.mozilla.org/en/DOM/window.atob
     * https://developer.mozilla.org/en/DOM/window.btoa
     *
     * window.btoa and $.base64.encode takes a string where charCodeAt is [0,255]
     * If any character is not [0,255], then an exception is thrown.
     *
     * window.atob and $.base64.decode take a base64-encoded string
     * If the input length is not a multiple of 4, or contains invalid characters
     *   then an exception is thrown.
     */
    var _PADCHAR = "=",
      _ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
      _VERSION = "1.0";


    function _getbyte64( s, i ) {
      // This is oddly fast, except on Chrome/V8.
      // Minimal or no improvement in performance by using a
      // object with properties mapping chars to value (eg. 'A': 0)

      var idx = _ALPHA.indexOf( s.charAt( i ) );

      if ( idx === -1 ) {
        throw "Cannot decode base64";
      }

      return idx;
    };

    function _getbyte( s, i ) {
      var x = s.charCodeAt( i );

      if ( x > 255 ) {
        throw "INVALID_CHARACTER_ERR: DOM Exception 5";
      }

      return x;
    };

    return{
      decode: function( s ) {
        var pads = 0,
          i,
          b10,
          imax = s.length,
          x = [];

        s = String( s );

        if ( imax === 0 ) {
          return s;
        }

        if ( imax % 4 !== 0 ) {
          throw "Cannot decode base64";
        }

        if ( s.charAt( imax - 1 ) === _PADCHAR ) {
          pads = 1;

          if ( s.charAt( imax - 2 ) === _PADCHAR ) {
            pads = 2;
          }

          // either way, we want to ignore this last block
          imax -= 4;
        }

        for ( i = 0; i < imax; i += 4 ) {
          b10 = ( _getbyte64( s, i ) << 18 ) | ( _getbyte64( s, i + 1 ) << 12 ) | ( _getbyte64( s, i + 2 ) << 6 ) | _getbyte64( s, i + 3 );
          x.push( String.fromCharCode( b10 >> 16, ( b10 >> 8 ) & 0xff, b10 & 0xff ) );
        }

        switch ( pads ) {
          case 1:
            b10 = ( _getbyte64( s, i ) << 18 ) | ( _getbyte64( s, i + 1 ) << 12 ) | ( _getbyte64( s, i + 2 ) << 6 );
            x.push( String.fromCharCode( b10 >> 16, ( b10 >> 8 ) & 0xff ) );
            break;

          case 2:
            b10 = ( _getbyte64( s, i ) << 18) | ( _getbyte64( s, i + 1 ) << 12 );
            x.push( String.fromCharCode( b10 >> 16 ) );
            break;
        }

        return x.join( "" );
      },
      encode: function( s ) {
        if ( arguments.length !== 1 ) {
          throw "SyntaxError: exactly one argument required";
        }

        s = String( s );

        var i,
          b10,
          x = [],
          imax = s.length - s.length % 3;

        if ( s.length === 0 ) {
          return s;
        }

        for ( i = 0; i < imax; i += 3 ) {
          b10 = ( _getbyte( s, i ) << 16 ) | ( _getbyte( s, i + 1 ) << 8 ) | _getbyte( s, i + 2 );
          x.push( _ALPHA.charAt( b10 >> 18 ) );
          x.push( _ALPHA.charAt( ( b10 >> 12 ) & 0x3F ) );
          x.push( _ALPHA.charAt( ( b10 >> 6 ) & 0x3f ) );
          x.push( _ALPHA.charAt( b10 & 0x3f ) );
        }

        switch ( s.length - imax ) {
          case 1:
            b10 = _getbyte( s, i ) << 16;
            x.push( _ALPHA.charAt( b10 >> 18 ) + _ALPHA.charAt( ( b10 >> 12 ) & 0x3F ) + _PADCHAR + _PADCHAR );
            break;

          case 2:
            b10 = ( _getbyte( s, i ) << 16 ) | ( _getbyte( s, i + 1 ) << 8 );
            x.push( _ALPHA.charAt( b10 >> 18 ) + _ALPHA.charAt( ( b10 >> 12 ) & 0x3F ) + _ALPHA.charAt( ( b10 >> 6 ) & 0x3f ) + _PADCHAR );
            break;
        }

        return x.join( "" );
      }
    }
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
      setDevStorage: function(isDev) { devStorage = isDev},
      getSASToken: function(fileName) {
        return $http.get('/getsas/' + fileName);
      },
      downloadFile: function() {
        return $http.get('/dlfile');
      },
      getContainers: function(server) {
        var url = server + (devStorage ? 'devstoreaccount1?comp=list' : '&comp=list' /*+ '&include=metadata' */);
        return doCall(url);


//        $.ajax({url: req,
//          crossDomain: true,
//          headers: {
//          'x-ms-date': '123',
//          'blah': 'ASDFASDF',
//          'Access-Control-Allow-Origin': '*'}
//        });
//        return $http.get(req, {
//          headers: {
//            'x-ms-date': '123',
//            'Access-Control-Allow-Origin': '*'}
//        });
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
      putFileInBlob: function(server, data, blockId) {
        var url = server + '&comp=block&blockid=' + zeroPad(blockId, 4);
        if(!sessions[url]){

        }
        return XHR.put(url, data, {
          headers: {
            'x-ms-date': new Date().toGMTString().replace('UTC', 'GMT'),
            'sas': server
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
      commitBlocks: function(server, blockCount, fileName) {
        console.log('commitBlocks. BlockCount= ' + blockCount);
        var url = server + '&comp=blocklist';
        var data = buildBlockListBody(blockCount);
        return XHR.put(url, data, {
          headers: {
            'x-ms-date': new Date().toGMTString().replace('UTC', 'GMT'),
            'x-ms-meta-filename': fileName
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



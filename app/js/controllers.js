'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('MyCtrl1', ['$scope', 'FileXfer', function($scope, FileXfer) {
    var reader;
    var blobArray = [];
    console.info('MyCtrl1');

    if (window.File && window.FileReader && window.FileList && window.Blob) {
      // Great success! All the File APIs are supported.
    } else {
      alert('The File APIs are not fully supported in this browser.');
    }

    $scope.fileList = [];
    $scope.fileProgress = '0';
    $scope.blobID = '0';

    $scope.filesChanged = function(evt) {
      console.log('ngChange!');
      console.log(evt);
    };

    $scope.ShowContainers = function() {
      FileXfer.getSASToken()
        .then(function(result) {
          FileXfer.getBlobProperties(result.data.url).
            then( function(result) {
              console.log(result);
            })
        })
    };

    $scope.DownloadFileOnServer = function() {
      FileXfer.downloadFile()
        .then(function(result) {
          console.log('finished download request');
        })
    }

    function captureFiles(files) {
      for (var i = 0, f; f = files[i]; i++) {
        console.log(f);
        $scope.fileList.push(f);
      }
    };

    function handleFileSelect(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      captureFiles(evt.target.files); // FileList object.
      $scope.$apply();

      reader = new FileReader();
      reader.onerror = function(evt) {
        switch(evt.target.error.code) {
          case evt.target.error.NOT_FOUND_ERR:
            alert('File Not Found!');
            break;
          case evt.target.error.NOT_READABLE_ERR:
            alert('File is not readable');
            break;
          case evt.target.error.ABORT_ERR:
            break; // noop
          default:
            alert('An error occurred reading this file.');
        };
      };

      reader.onload = function(e) {
        console.log('reader.onload');
          copyBlob(e.target);
      }

      function copyBlob(readerTarget) {
        var sasUrl = readFileBlobChunks.sasURL;
        var blobId = readFileBlobChunks.blobCount;
        var fileName = readFileBlobChunks.fileName;
        var data = new Uint8Array(readerTarget.result);
        $scope.blobID = blobId;
        //calling here creates lots of parallel copies, but not in order
        //good use case for Rx probably
        //turns out this is not really faster
        //readFileBlobChunks(readerTarget);
        FileXfer.putFileInBlob(sasUrl, data, blobId)
          .then(function(result) {
            console.log('returned from putFileInBlob');
            console.log(result);
            readFileBlobChunks(readerTarget);
            FileXfer.commitBlocks(sasUrl, blobId, fileName)
              .then(function(result){
                console.log('completed block commit');
              });
          }, function(err) {
            console.log(err);
          }, function(update){
            $scope.fileProgress = update.progress;
            $scope.bitRate = update.bitRate
          });
      }

      var file = evt.target.files[0];
      FileXfer.getSASToken(file.name)
        .then(function(result) {
          var sasURL = result.data.url;
          var blobSize = result.data.blobSize;
          readFileBlobChunks.sasURL = sasURL;
          readFileBlobChunks.blobSize = blobSize;
          readFileBlobChunks.fileName = file.name;
          var chunkSize = 4096000;
          var diff = file.size % chunkSize
          $scope.chunkCount = (file.size + (chunkSize - diff)) / chunkSize ;
          FileXfer.createSessionData(sasURL, file.size);
          readFileBlobChunks(reader, file, chunkSize);
        });
    };

    function readFileBlobChunks(reader, file, chunkSize) {
      if(file){
        //init
        readFileBlobChunks.isDone = false;
        readFileBlobChunks.file = file;
        if(chunkSize) {
          readFileBlobChunks.chunkSize = chunkSize;
        } else{
          readFileBlobChunks.chunkSize = 4096000;
        }
        readFileBlobChunks.startByte = 0;
        //readFileBlobChunks.endByte = Math.min(readFileBlobChunks.startByte + readFileBlobChunks.chunkSize, readFileBlobChunks.file.size);
        readFileBlobChunks.blobCount = 0;
      }
      //if this is a continuation (readyState:2 indicates Done from previous read) increment the counters
      if(reader.readyState === 2) {
        readFileBlobChunks.startByte += readFileBlobChunks.chunkSize;
        //readFileBlobChunks.endByte = Math.min(readFileBlobChunks.startByte + readFileBlobChunks.chunkSize, readFileBlobChunks.file.size);
      }
      if(readFileBlobChunks.startByte < readFileBlobChunks.file.size){
        readFileBlobChunks.blobCount += 1;
        console.log('reading blob ' + readFileBlobChunks.blobCount + ' byte range: ' + readFileBlobChunks.startByte + ' - ' + (readFileBlobChunks.startByte + readFileBlobChunks.chunkSize - 1));
        //var blob = readFileBlobChunks.file.slice(readFileBlobChunks.startByte, readFileBlobChunks.endByte);
        var blob = readFileBlobChunks.file.slice(readFileBlobChunks.startByte, readFileBlobChunks.startByte + readFileBlobChunks.chunkSize);
        reader.readAsArrayBuffer(blob);
      } else {
        readFileBlobChunks.isDone = true;
        console.log('read all blobs');
      }
      return readFileBlobChunks.isDone;
    }


    function handleDragOver(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }

    document.getElementById('files').addEventListener('change', handleFileSelect, false);
    var dropZone = document.getElementById('drop_zone');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);

    $scope.$on('$destroy', function(event) {
      console.info('leaving MyCtrl1');
      document.getElementById('files').removeEventListener('change', handleFileSelect);
      document.getElementById('drop_zone').removeEventListener('dragover', handleDragOver);
      document.getElementById('drop_zone').removeEventListener('drop', handleFileSelect);
    });

  }])
  .controller('MyCtrl2', [function() {

  }]);
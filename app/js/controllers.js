'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('MyCtrl1', ['$scope', 'FileXfer', function($scope, FileXfer) {
    var reader;
    console.info('MyCtrl1');

    if (window.File && window.FileReader && window.FileList && window.Blob) {
      // Great success! All the File APIs are supported.
    } else {
      alert('The File APIs are not fully supported in this browser.');
    }

    $scope.fileList = [];

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
      //FileXfer.getContainers('https://diagpoc.blob.core.windows.net:443/test/customerA?se=2014-02-17T05%3A37%3A48Z&sr=b&sv=2012-02-12&sig=mrr5h2v%2BFXA6JyvZD9ZoujO1iSQ7iTj4pnYgQCZofCs%3D');
      //FileXfer.getContainers('http://localhost:10000/');
    };

    $scope.PutFileInBlob = function() {
      FileXfer.getSASToken()
        .then(function(result) {
          FileXfer.put(result.data.url).
            then( function(result) {
              console.log(result);
            })
        })
    }



    function captureFiles(files) {
      for (var i = 0, f; f = files[i]; i++) {
        console.log(f);
        $scope.fileList.push(f);
      }
    };

    function handleFileSelect(evt) {
      captureFiles(evt.dataTransfer.files); // FileList object.
      $scope.$apply();

      reader = new FileReader();
    }
    function handleFileSelect(evt) {
      evt.stopPropagation();
      evt.preventDefault();

      captureFiles(evt.dataTransfer.files); // FileList object.
      $scope.$apply();
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
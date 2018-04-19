var app = angular.module('app', ['ngMaterial', 'ngMessages','ui.router','ngFileUpload']);
app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/login');
    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: '../templates/login.html'
        })
        .state('signup', {
          url: '/signup',
          templateUrl: '../templates/signup.html'
        })
        .state('home', {
          url: '/home',
          templateUrl: '../templates/home.html'
        });
      });

app.controller('ctrl',function($scope,$state,$http,$mdToast){
  $scope.sample = "hello world";
  $scope.registerUser = {}
  $scope.loginUser = {}
  $scope.selectedFolder = null;
  $scope.items = [1,2,3,4];
  $scope.newFolderName = null;
  $scope.userId = null;
  $scope.userFolders = [];
  $scope.filesArray = [];

  angular.element(document).ready(function () {
    let id = localStorage.getItem('userId');
    $scope.userFolders = [];
    if (id.length > 3) {
      console.log("innn");
      $state.go('home');
      $scope.userId = localStorage.getItem('userId');
      $scope.getFolderNames();
    }
  });

  $scope.login = function(data){
    console.log("login");
    $http.post('http://localhost:3001/signinUser', data).then(function(data){
      if (data.data.success) {
        localStorage.setItem('userDetails', JSON.stringify(data.data));
        localStorage.setItem('userId', data.data.userId);
          $scope.userId = data.data.userId;
          $state.go('home');
      }else{
        $mdToast.show(
          $mdToast.simple()
            .textContent('Invalid Credentials')
            .position('top right')
            .hideDelay(3000)
        );
      }
    });
  }
  $scope.signup = function(data){
    $http.post('http://localhost:3001/registerUser', data).then(function(data){
      if (data.data.success) {
        $mdToast.show(
          $mdToast.simple()
            .textContent('User Registered Successfully !!')
            .position('top right')
            .hideDelay(3000)
        );
        $state.go('login');

      }else{
        $mdToast.show(
          $mdToast.simple()
            .textContent('User Not Registered !!')
            .position('top right')
            .hideDelay(3000)
        );
      }
    });
  }
  $scope.signupPage= function(data){
    console.log("createFolder");
    $state.go('signup');
  }
  $scope.createFolder= function(data){
    console.log(data);
    $http.get('http://localhost:3001/createFolder/'+$scope.userId+'/'+data).then(function(data){
      if (data.data.success) {
        $mdToast.show(
          $mdToast.simple()
            .textContent('Folder Created')
            .position('top right')
            .hideDelay(3000)
        );
        $scope.getFolderNames();
        $scope.newFolderName = null;
      }
    });
  }

  $scope.getFolderNames= function(){
    console.log($scope.userId);
    $http.get('http://localhost:3001/getFolderNames/'+$scope.userId).then(function(data){
      $scope.userFolders = data.data.folders;
      $scope.selectedFolder = data.data.folders[0];
      $scope.loadFiles();
    });
  }

  $scope.loadFiles= function(){
    $http.get('http://localhost:3001/loadFiles/'+$scope.userId+'/'+$scope.selectedFolder).then(function(data){
      console.log(data);
      if (data.data.success) {
        if(!$scope.$$phase) {
            $scope.$apply(function () {
              $scope.filesArray = data.data.files;
              console.log($scope.filesArray);
            });
          }else{
            $scope.filesArray = data.data.files;
            console.log($scope.filesArray);
          }
      }
    });
  }

  $scope.downloadFile = function(data){
    console.log(data);
    window.location.assign(`http://localhost:3001/downloadFile/`+$scope.userId+'/'+$scope.selectedFolder+'/'+data);
  }

  $scope.deleteFile = function(data){
    console.log(data);
    $http.get(`http://localhost:3001/deleteFile/`+$scope.userId+'/'+$scope.selectedFolder+'/'+data).then(function(data){
      console.log(data);
      if (data.data.success) {
        $scope.loadFiles();

        $mdToast.show(
          $mdToast.simple()
            .textContent('File deleted !!')
            .position('top right')
            .hideDelay(3000)
        );
      }else{
        $mdToast.show(
          $mdToast.simple()
            .textContent('File could not be deleted !!')
            .position('top right')
            .hideDelay(3000)
        );
      }
    });
  }

  $scope.changeFolder = function(data){
    console.log(data);
      $scope.selectedFolder = data
      $scope.loadFiles();
  }
});

app.controller('MyCtrl',['Upload','$window',function(Upload,$window){
        var vm = this;
        vm.submit = function(){ //function to call on form submit
          console.log(".ksdbksdhb");
            if (vm.upload_form.file.$valid && vm.file) { //check if from is valid
                vm.upload(vm.file); //call upload function
            }
        }
        vm.upload = function (file) {
          var appElement = document.querySelector('[ng-controller=ctrl]');
          var appScope = angular.element(appElement).scope();
            Upload.upload({
                url: 'http://localhost:3001/uploadFile/'+appScope.userId+'/'+appScope.selectedFolder, //webAPI exposed to upload the file
                data:{file:file} //pass file as data, should be user ng-model
            }).then(function (resp) { //upload function returns a promise
              console.log(resp);
              if (resp.data.success) {
                appScope.loadFiles();
              }
            });
        };
    }]);

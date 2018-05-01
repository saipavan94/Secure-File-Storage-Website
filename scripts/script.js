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

app.controller('ctrl',function($scope,$state,$http,$mdToast,$mdDialog){
  $scope.showLogout = false;
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
      $state.go('home');
      $scope.showLogout = true;
      $scope.userId = localStorage.getItem('userId');
      $scope.getFolderNames();
    }else{
      $state.go('login');
      $scope.showLogout = false;
    }
  });

  $scope.loginCheck = function(){
    let id = localStorage.getItem('userId');
    console.log(id);
    if (id == null || id == undefined ) {
      $state.go('login');
    }
    if (id.length > 3) {
      $state.go('home');
      $scope.userId = localStorage.getItem('userId');
      $scope.getFolderNames();
    }else{
      $state.go('login');
    }
  }

  $scope.forgotPassword = function(data){
    console.log(data);
    $http.get('http://localhost:3001/forgotPassword/'+$scope.userId+'/'+data).then(function(data){
      console.log(data);
      if (data.data.success) {
        $mdToast.show(
          $mdToast.simple()
            .textContent('Decryption Key Mailed to user !!')
            .position('top right')
            .hideDelay(3000)
        );
      }
    });
  }

  $scope.showPrompt = function(ev) {
  var confirm = $mdDialog.prompt()
    .title('Enter Key To Encrypt')
    .textContent('Your file will be encrypted using this key')
    .initialValue('')
    .targetEvent(ev)
    .required(true)
    .ok('Upload')
    .cancel('Cancel');

  $mdDialog.show(confirm).then(function(result) {
    $scope.key = result;
    var appElement = document.getElementById('uploadCtrl');
    var appScope = angular.element(appElement).scope();
    appScope.up.submit();
  }, function() {
    $scope.key = '';
  });
};
$scope.decryptPrompt = function(ev,file) {
    $scope.key =''
    var confirm = $mdDialog.prompt()
      .title('Enter Key To Decrypt')
      .textContent('Your file will be decrypted using this key')
      .initialValue('')
      .targetEvent(ev)
      .required(true)
      .ok('Download')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(function(result) {
      $scope.downloadFile(file,result)
      appScope.up.submit();
    }, function() {
      $scope.key = '';
    });
};

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

  $scope.deleteFolder= function(data){
    console.log(data);
    $http.get('http://localhost:3001/deleteFolder/'+$scope.userId+'/'+data).then(function(data){
      if (data.data.success) {
        $mdToast.show(
          $mdToast.simple()
            .textContent('Folder Deleted')
            .position('top right')
            .hideDelay(3000)
        );
        $scope.getFolderNames();
        $scope.newFolderName = null;
      }
    });
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
            });
          }else{
            $scope.filesArray = data.data.files;
          }
      }
    });
  }

  $scope.logout = function(){
    localStorage.removeItem('userDetails');
    localStorage.removeItem('userId');
    $state.go('login');
  }

  $scope.downloadFile = function(data,key){
    console.log(data);
    let filedata = data
    $http.get("http://localhost:3001/checkHash/"+$scope.userId+'/'+$scope.selectedFolder+'/'+data+'/'+key).then(function(data){
      console.log(data);
      if (data.data.valid) {
        window.location.assign(`http://localhost:3001/downloadFile/`+$scope.userId+'/'+$scope.selectedFolder+'/'+filedata+'/'+key);
      }else {
        alert('Invalid Decryption Key, Try Again');
      }
    });
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
          console.log(appScope.key);
            Upload.upload({
                url: 'http://localhost:3001/uploadFile/'+appScope.userId+'/'+appScope.selectedFolder+'/'+appScope.key, //webAPI exposed to upload the file
                data:{file:file} //pass file as data, should be user ng-model
            }).then(function (resp) { //upload function returns a promise
              console.log(resp);
              if (resp.data.success) {
                appScope.loadFiles();
              }
            });
        };
    }]);

var app = angular.module('app', ['ngMaterial', 'ngMessages','ui.router','ngFileUpload','ngMaterialDatePicker']);
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
        })
        .state('createProgram', {
          url: '/createProgram',
          templateUrl: '../templates/createProgram.html'
        })
        .state('dataTable', {
          url: '/dataTable',
          templateUrl: '../templates/table.html'
        });
      });

app.controller('ctrl',function($scope,$state,$http,$mdToast,$mdDialog){
  $scope.registerUser = {};
  $scope.program = {};
  $scope.mailingData = {};
  $scope.subP = false;
  angular.element(document).ready(function () {
    $scope.scope = JSON.parse(localStorage.getItem('userDetails')).rights;
    let id = localStorage.getItem('userId');
    $scope.userFolders = [];
    if (id.length > 3) {
      $scope.showLogout = true;
      $state.go('home');
      $scope.userId = localStorage.getItem('userId');
    }else{
      $scope.showLogout = false;
      $state.go('login');
    }
  });

  $scope.example = '           <thead> <tr> <th>Height</th> <th>Weight</th> <th>Age</th> <th>Comment</th> </tr> </thead> <tfoot> <tr> <th>Height</th> <th>Weight</th> <th>Age</th> <th>Comment</th> </tr> </tfoot> '
  $scope.example2 = '  <thead> <tr> <th>Name</th> <th>Phone</th> <th>User Id</th> <th>Email</th> <th>info </th> </tr> </thead> <tfoot> <tr> <th>Name</th> <th>Phone</th> <th>User Id</th> <th>Email</th> <th> info </th> </tr> </tfoot>'
  $scope.sendEmailToInstructor = function(){
    var body = {
      customerEmail : JSON.parse(localStorage.getItem('userDetails')).email,
      instructorId : $scope.dataTableInfo.userId,
      data : $scope.mailingData
    }
    $http.post('http://localhost:3004/sendEmail',body).then(function(data){
        console.log(data);
    });
  }

  $scope.home = function(){
    $scope.subP = false;
    $state.go('home');
    $scope.getPrograms();
  }

  $scope.logout = function(){
    localStorage.removeItem('userDetails');
    localStorage.removeItem('userId');
    $state.go('login');
  }

  // Get the modal
  var modal = document.getElementById('myModal');

  // Get the button that opens the modal
  var btn = document.getElementById("myBtn");

  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];

  // When the user clicks the button, open the modal
  btn.onclick = function() {
      modal.style.display = "block";
  }

  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
      modal.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it
  // window.onclick = function(event) {
  //     if (event.target == modal) {
  //         modal.style.display = "none";
  //     }
  // }




  // $scope.programs =[]
  function DialogController($scope, $mdDialog) {
    $scope.modalData = {};
    $scope.hide = function() {
      $mdDialog.hide();
    };

    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.answer = function(answer) {
      $mdDialog.hide(answer);
    };
  }


  $scope.intModal = function(data){
    $scope.tempId = data._id;

    $scope.showAdvanced();
  }

  $scope.sendEmail = function(){
    modal.style.display = "block";

  }

    $scope.showAdvanced = function(ev) {
    $mdDialog.show({
      controller: DialogController,
      templateUrl: '../templates/dialogue.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
    })
    .then(function(answer) {
      $scope.updateCustomerProgramDetails(answer);
    }, function() {

    });
  };


  $scope.updateCustomerProgramDetails = function(details){
    var body ={
      userId : JSON.parse(localStorage.getItem('userDetails')).userId,
      programId : $scope.tempId,
      data : details
     }
    $http.post('http://localhost:3004/updateCustomerProgramDetails',body).then(function(data){


    });
  }
  $scope.subP = false;

  $scope.subscribedPrograms = function(){
    var body ={
      userId : JSON.parse(localStorage.getItem('userDetails')).userId
     }
    $http.post('http://localhost:3004/subscribedPrograms',body).then(function(data){
      var a =[]
      for(var i=0 ; i<data.data.length ; i ++){
        a.push(data.data[i].pData)
      }
      $scope.programs = a;
      for (var i = 0; i < $scope.programs.length; i++) {
      $scope.programs[i].slots = JSON.parse($scope.programs[i].slots)
      $scope.programs[i].selectedSlot = data.data[i].selectedSlot
      }
      console.log(data);
      $scope.subP = true;

    });
  }

  $scope.deleteProgram = function(data,slot){
    var body ={
      userId : JSON.parse(localStorage.getItem('userDetails')).userId,
      data: data,
      slotNumber : slot
     }
     console.log(body);
    $http.post('http://localhost:3004/deleteProgram',body).then(function(data){
      $scope.yourPrograms();
      location.reload();
    });
  };


  $scope.infoPage = function(data){
    $scope.dataTableInfo = data;
    $state.go('dataTable')
    console.log(data);
  }

  $scope.programInfoPage = function(data){
    $scope.programInfoPageData = data
    $state.go('dataTable')
    console.log(data);
  }



  $scope.initProgramDataTable = function(){
    var body = {
      programId : $scope.programInfoPageData._id
    }

    $http.post('http://localhost:3004/initProgramDataTable',body).then(function(data){
      console.log(data.data.data);
    var dataSet = data.data.data
    $scope.programsTable = true;
    // document.getElementById('example2').innerHtml = $scope.example2;
    $('#example2').DataTable( {
           data: dataSet,
           columns: [
               { name:"Name", data: "name" },
               { name:"Phone",data: "phone" },
               { name:"User Id",data: "userId" },
               { name:"Email",data: "email" },
               {
                 "data": null,
                 "defaultContent": "<button>View</button>"
               }
           ]
       } );

       $('#example2 tbody').on('click', 'td', function () {
           var table = $('#example2').DataTable();
           console.log(table.cell( this ).data());
           // $scope.dataTableInfo = table.cell( this ).data();
           $scope.initDataTableTwo(table.cell( this ).data());
       });
     })
  }


  $scope.initDataTableTwo = function(data){
    var body = {
      userId : data.userId,
      programId : $scope.programInfoPageData._id
    }

    $http.post('http://localhost:3004/getUserProgramsData',body).then(function(data){
      console.log(data);
    var dataSet = data.data.data;
    $scope.programsTable = false;
    // document.getElementById('example').innerHtml = $scope.example;

    $('#example').DataTable( {
           data: dataSet,
           columns: [
             { name: "Height", data: "height" },
             { name: "Weight",data: "weight" },
             { name: "Age",data: "age" },
             { name: "Comment",data: "comment" }
           ],
           bDestroy: true

       } );
       // $("#example").dataTable().fnDestroy();

     })
  }

  $scope.BackToMainTable = function(){
    $scope.programsTable = true;
  }

  $scope.initDataTable = function(){
    var body = {
      userId : $scope.userId,
      programId : $scope.dataTableInfo._id
    }

    $http.post('http://localhost:3004/getUserProgramsData',body).then(function(data){
      console.log(data);
    var dataSet = data.data.data
    // document.getElementById('example').innerHtml = $scope.example;
    $scope.programsTable = false;

    $('#example').DataTable( {
           data: dataSet,
           columns: [
             { name: "Height", data: "height" },
             { name: "Weight",data: "weight" },
             { name: "Age",data: "age" },
             { name: "Comment",data: "comment" }
           ],
            bDestroy: true
       } );

       // $("#example").dataTable().fnDestroy();

     })
  }

  $scope.selectProgram = function(data,slot){
    console.log(data,slot);
    var body ={
      userId : JSON.parse(localStorage.getItem('userDetails')).userId,
      programId : data._id,
      slotNumber : slot
    }
    $http.post('http://localhost:3004/CustomerSelectedProgram',body).then(function(data){
      if (data.data.success){
      $mdToast.show(
        $mdToast.simple()
          .textContent('Successfully Registered  !!')
          .position('top right')
          .hideDelay(3000)
      );
    }else if(data.data.success = "registered") {
      alert("You have already registered !!");
    }else {
      alert("The Selected Program is Full.");

    }
      $state.go('home');
    });
  }

  $scope.yourPrograms = function(){
    var body = {
      userId : JSON.parse(localStorage.getItem('userDetails')).userId
    }
    $http.post('http://localhost:3004/yourPrograms',body).then(function(data){
      $scope.programs = data.data;


      for (var i = 0; i < $scope.programs.length; i++) {
        $scope.programs[i].slots = JSON.parse($scope.programs[i].slots)
       }
      });
  }

  $scope.getPrograms = function(){
    $http.get('http://localhost:3004/getPrograms').then(function(data){

      $scope.programs = data.data;
      console.log($scope.programs);

      for (var i = 0; i < $scope.programs.length; i++) {
        $scope.programs[i].slots = JSON.parse($scope.programs[i].slots)
      }

    });
  }

  $scope.createNewProgram =function(data){
    data.userId = JSON.parse(localStorage.getItem('userDetails')).userId;
    $http.post('http://localhost:3004/createNewProgram', data).then(function(data){
      $state.go('home');
    });
  }

  $scope.createProgram = function(){
    $state.go('createProgram');
  }
  $scope.signup = function(data){
    console.log(data);
    $http.post('http://localhost:3004/registerUser', data).then(function(data){
      if (data.data.success) {
        $mdToast.show(
          $mdToast.simple()
            .textContent('User Registered Successfully !!')
            .position('top right')
            .hideDelay(3000)
        );
        $scope.registerUser = {};

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

  $scope.login = function(data){
    console.log("login");
    $http.post('http://localhost:3004/signinUser', data).then(function(data){
      if (data.data.success) {
        localStorage.setItem('userDetails', JSON.stringify(data.data));
        localStorage.setItem('userId', data.data.userId);
          $scope.userId = data.data.userId;
          $state.go('home');
          location.reload();

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

  $scope.logout = function(){
    localStorage.removeItem('userDetails');
    localStorage.removeItem('userId');
    $state.go('login');
  }

});

/**
 * resetPasswordController
 *
 *
 */
(function() {
    'use strict';

    angular
        .module('govtID').controller('mainController', mainController);

    mainController.$inject = ['$scope', '$rootScope','fileUpload', '$http', '$log', '$state', '$window', '$translate', '$cookies', '$translatePartialLoader', '$timeout','ngProgressFactory'];

    function mainController($scope, $rootScope,fileUpload, $http, $log, $state, $window, $translate, $cookies, $translatePartialLoader, $timeout, ngProgressFactory) {

      
        $scope.defaultMainLabel = "Select a form of ID";
        $rootScope.showSigninDropdown = false;
        $('.animate-hide').css('width',$('.account-select').width()-20);
        $scope.uploadPhase1 = true;
        $scope.uploadPhase2 = false;
        $scope.uploadPhase3 = false;
        $scope.uploadPhase4 = false;
        $scope.uploadPhase5 = false;
        $scope.uploadPhase6 = false;

        // $scope.uploadPhase1 = false;
        //          $scope.uploadPhase2 = true;
        //          $scope.uploadPhase3 = true;
        //          $scope.uploadPhase4 = true;
        //          $scope.uploadPhase5 = true;
        //          $scope.uploadPhase6 = true;

        

              //$scope.progressbar.set();

        $scope.toggleSigninDropdown = function(val){
          $('.animate-hide').css('width',$('.account-select').width()-20);
          $rootScope.showSigninDropdown = !$rootScope.showSigninDropdown;
          if($rootScope.showSigninDropdown)
          {            
              $('.animate-hide').css('visibility','visible');
              $('.animate-hide').css('height','330px');            
          }
          else{
            $('.animate-hide').css('visibility','hidden');
            $('.animate-hide').css('height','0px');       
          }
        };

        $scope.itemSelected = function(mainValue, defaultTxt, subValue, defaultSubTxt)
        {
          $scope.defaultMainLabel = defaultTxt;
          //$('#option'+dropDownCount).removeClass("hover-color");
          $scope.ddValueSelected = mainValue;
          $scope.toggleSigninDropdown();
          $state.go('imageUpload');
        }

        $("#frontImage").click(function () {
          $("#file1").trigger('click');
        });

        $("#backImage").click(function () {
          $("#file2").trigger('click');
        });

        $scope.navigateBack = function(pageToNavigate){
          $state.go(pageToNavigate);
        }

        $scope.submitImages = function(){
          $state.go('secureSubmission');
          $scope.secureSubmissionLaunch();
        }

        $scope.scan = function(){
          $state.go('scanningSubmission')
          $scope.scanningSubmissionLaunch();
        }
        $scope.finish = function(){
          $state.go('finishingSubmission')
          scope.finishingSubmissionLaunch();
        }

        $scope.secureSubmissionLaunch = function(){
          $scope.progressbarSecure = ngProgressFactory.createInstance();
          $scope.progressbarSecure.compileDirective("ng-progress");
          $scope.progressbarSecure.set(25)
          $('#ngProgress-container').appendTo('.progress-bar-secure');
        }

        $scope.scanningSubmissionLaunch = function(){
          $scope.progressbarScan = ngProgressFactory.createInstance();
          $scope.progressbarScan.compileDirective("ng-progress");
          $scope.progressbarScan.set(55)
          $('#ngProgress-container').appendTo('.progress-bar-scan');
        }

        $scope.finishingSubmissionLaunch = function(){
          $scope.progressbarFinish = ngProgressFactory.createInstance();
          $scope.progressbarFinish.compileDirective("ng-progress");
          $scope.progressbarFinish.set(85);
          $('#ngProgress-container').appendTo('.progress-bar-finish');
        }


        $scope.backFileUpload = function(ele) {

          var files = ele.files;
            var l = files.length;
            
            $scope.backFileName = "";

            for (var i = 0; i < l; i++) {                
                console.log("size : " + files[i].size);
                console.log("type : " + files[i].type);
                console.log("date : " + files[i].lastModified);
                console.log("name : " + files[i].name);
                $scope.backFileName = files[i].name;
            }

            if($scope.backFileName !== "")
            {
              
              $scope.uploadPhase1 = false;
              $scope.uploadPhase2 = true;
              $scope.uploadPhase3 = true;
              $scope.uploadPhase4 = true;
              $scope.uploadPhase5 = false;
              $scope.uploadPhase6 = false;

              $scope.progressbarBack = ngProgressFactory.createInstance();
              $scope.progressbarBack.compileDirective("ng-progress1");
              $scope.progressbarBack.start();
              $('#ngProgress-container1').appendTo('.progress-bar-back');
              
              
            
            
              $('.percentage-back').empty()
              $('.percentage-back').append(parseInt($scope.progressbarBack.status())+"%");

              setTimeout(function(){
                 $('.percentage-back').empty()
                 $('.percentage-back').append(parseInt($scope.progressbarBack.status())+"%");
              }, 1500);
              

              setTimeout(function(){
                 $('.percentage-back').empty()
                 $('.percentage-back').append("100%");
                 $scope.progressbarBack.set(100);
                 $scope.uploadPhase1 = false;
                 $scope.uploadPhase2 = true;
                 $scope.uploadPhase3 = true;
                 $scope.uploadPhase4 = true;
                 $scope.uploadPhase5 = true;
                 $scope.uploadPhase6 = true;
                 $scope.$apply();
              }, 2000);
            }
            $scope.$apply();

        };

        $scope.uploadFile = function(){
          
        var file = $scope.myFile;
        console.log('file is ' );
        console.dir(file);
        var uploadUrl = "/document-identification-web/identity/documents/identification";
        //$scope.sendImageToServer(file, uploadUrl);

        $scope.sendImageToServer( file, uploadUrl )
                        .then( function( success ){
                            console.log( 'response', success.data );
                            alert("sucess")

                            

                        }).catch( function(resp){
                          alert("fail")
                          
                        } );


/*var img = file;
var urlRoot = uploadUrl;
var formData = new FormData();


img.contentID = "govtIdImage";
img["Content type"] = "image/jpeg";

                formData.append( "scanIdImage", img );

formData.append( "scanIdImageTest", "Testing the new Object" );

                
                formData.append( "scanIdDataRequest", new Blob( [ JSON.stringify( data )], {
                    type: "application/json",
                    ContentID:"identificationRequest"
                }));*/

// var blob = new Blob([JSON.stringify(data)], {type : 'application/json'});
// var fileOfBlob = new File([blob], 'req.json');
// formData.append("scanIdDataRequest", fileOfBlob);

//formData.append( "scanIdDataRequest",new Blob([JSON.stringify(data)]));
console.log(formData)

/*var xhr = new XMLHttpRequest();
xhr.open('POST', urlRoot, true);
xhr.onload = function () {
    debugger;
    alert(this.responseText);
};
xhr.send(formData);*/


    };

    

    $scope.sendImageToServer = function( img,  urlRoot){
                var formData = new FormData();


img.contentID = "govtIdImage";
img["Content-Type"] = "image/jpeg";

                formData.append( "govtIdImage", img );



                
                formData.append( "identificationRequest", new Blob( [ JSON.stringify( data )], {
                    type: "application/json",
                    ContentID:"identificationRequest"
                }));

//formData.append( "scanIdDataRequest",new Blob([JSON.stringify(data)]));
console.log(formData)

var xhr = new XMLHttpRequest();
xhr.open('POST', urlRoot, true);
xhr.onload = function () {
    // do something to response
    console.log(this.responseText);
};
xhr.send(data);


                return $http({
                    url: urlRoot,
                    method: "POST",
                    headers: {
                        'Api-Key': 'IRIS',
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Client-Correlation-Id': 'Teja',
                        'Customer-IP-Address': '127.0.0.1'
                    },
                    data: formData
                });
            };

var data = {
      "businessUnit": "EOS",
      "referenceId": "",
      "documentMetaData": {
            "authenticationSensitivity": "Normal",
            "classificationMode" : "Automatic",
            "processMode": "Default",
            "device": {
                  "hasContactlessChipReader": "false",
                  "hasMagneticStripeReader": "false",
                  "serialNumber": "serialNumber",
                  "manufacturer": "Apple",
                  "model": "iPhone 5S",
                  "sensorType": "Mobile"
            },
            "documentType": {
                  "class": "DriversLicense",
                  "classCode": "classCode",
                  "className": "className",
                  "isGeneric": "false",
                  "issue": "issue",
                  "issuerCode": "issuerCode",
                  "issuerName":"issuerName",
                  "issueType": "issueType",
                  "keesingCode": "keesingCode",
                  "documentTypeSize": "CheckCurrency",
                  "Name": "name"
            },
            "imageDataItems":
                  [
                    {
                      "light": "White",
                      "side": "Front",
                      "image": {"imageId": "Automatic"}
                    }
                  ]

      }

};



        $scope.frontFileUpload = function(ele) {
            var files = ele.files;
            var l = files.length;
            
            $scope.frontFileName = "";

            for (var i = 0; i < l; i++) {
                
                console.log("size : " + files[i].size);
                console.log("type : " + files[i].type);
                console.log("date : " + files[i].lastModified);
                console.log("name : " + files[i].name);

                $scope.frontFileName = files[i].name;
            }

            if($scope.frontFileName !== "")
            {
              
              $scope.uploadPhase1 = false;
              $scope.uploadPhase2 = true;
              $scope.uploadPhase3 = false;
              $scope.uploadPhase4 = false;
              $scope.uploadPhase5 = false;
              $scope.uploadPhase6 = false;

              var uploadUrl = "https://docverif-qa.kdc.capitalone.com/document-identification-web/identity/document/identification";
        $scope.sendImageToServer(file, uploadUrl);
             

              /*$scope.progressbar = ngProgressFactory.createInstance();
              $scope.progressbar.compileDirective("ng-progress");
              
              $scope.progressbar.start();
              $('#ngProgress-container').appendTo('.progress-bar');
              $('.percentage').empty()
              $('.percentage').append(parseInt($scope.progressbar.status())+"%");

              setTimeout(function(){
                 $('.percentage').empty()
                 $('.percentage').append(parseInt($scope.progressbar.status())+"%");
              }, 1000);
              

              setTimeout(function(){
                 $('.percentage').empty()
                 $('.percentage').append("100%");
                 $scope.progressbar.set(100);
                 $scope.uploadPhase1 = false;
                 $scope.uploadPhase2 = true;
                 $scope.uploadPhase3 = true;
                 $scope.uploadPhase4 = false;
                 $scope.uploadPhase5 = false;
                 $scope.uploadPhase6 = false;
                 $scope.$apply();
              }, 2000);*/




              
            }
            $scope.$apply();
        }

        $( window ).resize(function(){
          setTimeout(function(){
            $('.animate-hide').css('width',$('.account-select').width()-20);
          }, 250);
           
    });



    }
})();

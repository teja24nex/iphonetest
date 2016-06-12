(function() {

    'use strict';

    angular.module('app')
        .directive('scanIdCanvas', function() {
            return {
                restrict: 'E',
                priority: 0,
                bindToController: true,
                controller: 'ScanIdCanvasController as canvas',
                templateUrl: '/components/scan-id-canvas/scan-id-canvas.html'
            };
        })
        .controller('ScanIdCanvasController', function($scope, $state, $q, config, contentService, dataCollectionService, scanService, scanIdImageService, processingService, progressService, LOC_VARS, fieldService) {

            var vm = this;
            var isFrontSent = false;
            var croppedData = {}; // store front and/or back as keys here
            // All IDs are type 1 unless otherwise stated in this map
            var idMap = {
                CanadianPassport: 3,
                ForeignPassport: 3
            };
            var currentSideToSend = 'Front';
            var referenceId;
            contentService.getMessages()
                .then(function() {
                    vm.scanIdControls = [
                        {
                            displayButton: false,
                            text: "Capture Back of ID", /*contentService.getMessage('button.continue')*/
                            disabled: false,
                            type: 'submit back-capture',
                            isLabelOnly: true,
                            position: "right",
                            for: "cameraInput",
                            id: 'capture',
                            bindEvents:{
                                click: function(){
                                    if( !isFrontSent ){
                                        console.log('inside front')
                                        cropAndSend( "Front" );
                                        vm.isFrontSent = true;
                                    }
                                    currentSideToSend = "Back";
                                    scanService.setVisibilityForControlsButton(vm.scanIdControls, 'capture', false );
                                    scanService.setVisibilityForControlsButton(vm.scanIdControls, 'crop', true );
                                }
                            }
                        },
                        {
                            displayButton: true,
                            text: "Retake", /*contentService.getMessage('button.continue')*/
                            disabled: false,
                            type: 'progressive retake',
                            position: "right",
                            for: "retake",
                            id: 'retake',
                            isLabelOnly: true,
                            bindEvents: {
                                click: function(){
                                    var _this = event.target;
                                    if (!scanService.scanCanvas) {
                                        scanService.scanCanvas = new ScanID(_this, '#scan-container .scan-inner', scanIdOptions, true);
                                    }
                                    scanService.setVisibilityForControlsButton(vm.scanIdControls, 'submit', false );
                                    scanService.setVisibilityForControlsButton(vm.scanIdControls, 'crop', true );
                                    scanService.setVisibilityForControlsButton(vm.scanIdControls, 'capture', false );
                                }

                            }
                        },
                        {
                            displayButton: false,
                            text: "Submit", /*contentService.getMessage('button.continue')*/
                            disabled: false,
                            type: 'submit',
                            position: "right",
                            for: "submit",
                            id: "submit",
                            onClick: function onClick( $event ) {

                                // showOverlay
                                if($event.shiftKey && (LOC_VARS.ENV === 'local' || LOC_VARS.ENV === 'dev')){
                                    progressService.loadNextStep();
                                    dataCollectionService.formData.storeEmployeeId = "12345";
                                    dataCollectionService.formData.lastName = "PONG";
                                    dataCollectionService.formData.addressLine1 = "Approved";
                                    dataCollectionService.formData.addressPostalCode = "60008";
                                    dataCollectionService.formData.idType = {value: "DriversLicense"};
                                    dataCollectionService.formData.placeIdIssued = "Netherlands";
                                    dataCollectionService.formData.dateOfBirth = "09121989";
                                    dataCollectionService.formData.idExpirationDate = "01012020";
                                    dataCollectionService.formData.placeIdIssued.value = "AB";
                                    dataCollectionService.formData.idNumber = "ABC999";
                                    dataCollectionService.formData.firstName = "Test";
                                    dataCollectionService.formData.autocomplete = "77 W Wacker Dr, Chicago, IL, United States";
                                    processingService.setContentKey( 'processing-scan-Id' );
                                    processingService.setVisible( false );
                                    fieldService.touchAllFields();
                                }else{
                                    cropAndSend();
                                    processingService.setContentKey( 'processing-scan-Id' );
                                }

                            }
                        },
                        {
                            displayButton: true,
                            text: 'Crop', /*contentService.getMessage('button.cancel')*/
                            disabled: false,
                            type: 'crop',
                            position: "right",
                            id: 'crop',
                            onClick: function onClick() {
                                croppedData[ currentSideToSend.toLowerCase() ] = scanService.scanCanvas.getCroppedImageData( getIdType() );
                                scanService.scanCanvas.preview();
                                scanService.setVisibilityForControlsButton(vm.scanIdControls, 'crop', false );
                                scanService.setVisibilityForControlsButton(vm.scanIdControls, 'submit', true );

                                // default id type to send is 1 unless mapped in idMap
                                var idType = getIdType();

                                // if you are submitting a DL then we will always capture the back of it
                                if( idType === 1){
                                    scanService.setVisibilityForControlsButton(vm.scanIdControls, 'capture', true );
                                    scanService.setVisibilityForControlsButton(vm.scanIdControls, 'submit', false );
                                     //scanService.setVisibilityForControlsButton(vm.scanIdControls, 'crop', true );

                                    // if you've taken the front already, you get to crop again
                                    if( currentSideToSend.toLowerCase() === 'back' ){
                                        scanService.setVisibilityForControlsButton(vm.scanIdControls, 'capture', false );
                                        scanService.setVisibilityForControlsButton(vm.scanIdControls, 'submit', true );
                                    }
                                }
                            }
                        },
                        {
                            displayButton: true, //config.components.showFormBuilderExitButton,
                            configshow: !config.components.showExit,
                            text: "Cancel", //contentService.getMessage('common.exit_application.button.text'),
                            disabled: false,
                            type: 'cancel',
                            id: 'cancel',
                            position: "left",
                            onClick: function onClick() {
                                // exitApplicationService.toggleStates.active = !exitApplicationService.toggleStates.active;
                                scanService.showCanvas = false;
                                scanService.setVisibilityForControlsButton(vm.scanIdControls, 'crop', true );
                                scanService.setVisibilityForControlsButton(vm.scanIdControls, 'retake', true );
                                scanService.setVisibilityForControlsButton(vm.scanIdControls, 'submit', false );
                                scanService.setVisibilityForControlsButton(vm.scanIdControls, 'capture', false );

                            }
                        }
                    ];
                });


            function getIdType(){
                var idType = 1;
                if( idMap[ dataCollectionService.formData.idType.value ] ){
                    idType = idMap[ dataCollectionService.formData.idType.value ];
                }
                return idType;
            }

            function cropAndSend( sideOverride ){
                // convert the string to a byte array so that it can be sent as FormData and accepted ( Java side does proper conversion )
                var sideToUse = sideOverride || currentSideToSend;
                var byteCharacters =  croppedData[ sideToUse.toLowerCase() ];
                var byteNumbers = new Array(byteCharacters.length);
                for (var i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                var imgBlob = new Blob([byteArray], {type: 'image/jpeg'}); // blob becomes image to attach
                var idType = getIdType(); // default id type to send is 1 unless mapped in idMap
                var documentTypeSize = 'ID' + ( idMap[ dataCollectionService.formData.idType.value ] || 1 );
                var documentType = dataCollectionService.formData.idType.value;
                if( documentTypeSize === "ID3" ){
                    documentType = "Passport";
                }

                function makeRequest(){
                    console.log('request made')
                     //make request to server with front of id
                    scanIdImageService.sendImageToServer( imgBlob, sideToUse, referenceId, documentType, documentTypeSize )
                        .then( function( success ){
                            console.log( 'response', success.data );
                            var resp = success.data;

                            if( resp.error ){
                                return $q.reject(new Error( resp.error ));
                            }
                            switch( resp.documentStatus.toLowerCase() ){
                                case "backimagerequired": // if back of image is required, record ref id
                                    referenceId = resp.referenceId;
                                    break;
                                case "passed":
                                case "attention":
                                    onSuccessfulData( resp );
                                    break;
                                case "unknown":
                                    return $q.reject( new Error( 'there was an error with getting data, take user to manual entry') );
                            }

                        }).catch( onError );
                }

                // for any error in scanId, we should destroy the component and take user to manual entry
                function onError( error ){
                    console.log( 'error', error );
                    scanService.scanCanvas.destroy();
                    progressService.loadNextStep();
                    scanService.showCanvas = false;
                    processingService.setVisible( false );
                }

                function onSuccessfulData( response ){
                    progressService.loadNextStep();
                    parseResponseToDataCollectionService( response );
                    scanService.scanCanvas.destroy();
                    scanService.showCanvas = false;
                    processingService.setVisible( false );
                }

                function parseResponseToDataCollectionService( response ){
                        for( var key in response ){
                            var val = response[ key ];
                            if( ! val ){
                                continue;
                            }
                            var streetAddress, city, state, zip, issuedState;
                            switch( key ){
                                case "lastName":
                                    dataCollectionService.formData.lastName = val;
                                    break;
                                case "birthDate":
                                    val = new Date( val );
                                    val = formatToTwoDigitDate( val.toLocaleDateString() );
                                    dataCollectionService.formData.dateOfBirth = val;
                                    break;
                                case "issueStateName":
                                    var place = utilityService.findKey($scope.formData.sections[1].fieldsets[3].fields[0].options,{"name": val});
                                    dataCollectionService.formData.placeIdIssued = place;
                                    //var place = linearSearch($scope.formData.sections[1].fieldsets[3].fields[0].options,"name", "value", val);
                                    break;
                                case "city":
                                    dataCollectionService.formData.city = val;
                                    //city = value;
                                    break;
                                case "docNumber":
                                    dataCollectionService.formData.idNumber = val;
                                    break;
                                case "expirationDate":
                                    val = new Date( val );
                                    val = formatToTwoDigitDate( val.toLocaleDateString() );
                                    dataCollectionService.formData.idExpirationDate = val;
                                    break;
                                case "firstName":
                                    dataCollectionService.formData.firstName = val;
                                    break;
                                case "addressLine1":
                                    dataCollectionService.formData.addressLine1 = val;
                                    dataCollectionService.formData.autocomplete = val;
                                    //streetAddress = value;
                                    break;
                                case "middleName":
                                    val = val.substr( 0, 1 );
                                    dataCollectionService.formData.middleName = val;
                                    break;
                                case "postalCode":
                                    dataCollectionService.formData.addressPostalCode = val;
                                    //zip = value;
                                    break;
                                case "state":
                                    dataCollectionService.formData.addressState = val;
                                    //state = value;
                                    break;
                            }
                        }
                    //vm.copy = angular.copy(dataCollectionService.formData.idType);
                    //dataCollectionService.formData.idType = '';
                    //dataCollectionService.formData.idType = vm.copy;
                    //var completeAddress = streetAddress + ' ' + city + ' ' + state + ' ' + zip;
                    //completeAddress.toString().toLowerCase();
                    //dataCollectionService.formData.autocomplete = completeAddress
                    //
                    //console.log(dataCollectionService.formData.autocomplete)
                }
                if( idType === 1 ){
                    // separate logic for front and back of image requests
                    if( sideToUse.toLowerCase() === 'back' ){
                        getReferenceId().then( function(){
                            makeRequest();
                        });
                    } else {
                        makeRequest();
                    }
                } else if( idType === 3 ){
                    makeRequest();
                }
            }

            //function capitalize(str){
            //    console.log('str' + str.toString().charAt(0).toUpperCase() + str.slice(1))
            //    return str.toString().charAt(0).toUpperCase() + str.slice(1);
            //}
            function formatToTwoDigitDate( localedDateString ){
                var arr = localedDateString.split( '/' ); // remove slashes
                for( var i = 0; i < 2; i++ ){
                    if( arr[ i ].length < 2 ){
                        arr[ i ] = 0 + '' + arr[ i ];
                    }
                }
                arr = arr.join( '' ); // don't join again with slashes
                return arr;
            }
            var refIdWatcher;
            function getReferenceId(){
                var def = $q.defer();

                if( referenceId ){
                    def.resolve( referenceId );
                } else {
                    if( refIdWatcher ){
                        refIdWatcher();
                    }
                    refIdWatcher = $scope.$watch( function(){
                        return referenceId;
                    }, function( newVal, oldVal){
                        if( newVal ){
                            def.resolve( referenceId );
                            refIdWatcher();
                        }
                    });
                }
                return def.promise;
            }

            $scope.$on( '$destroy', function(){
                if( scanService.scanCanvas ){
                    scanService.scanCanvas.destroy();
                }
            });
        })
        .service('scanService', function(progressService){
            var service = this;
            service.scanIdOptions = {
                minCropBoxWidth: 400,
                minCropBoxHeight: 400,
                built: function () {
                    service.showCanvas = true;
                }
            };
            service.scanCanvas = null;
            service.buildCanvas = function (input, scanOptions){
                service.scanCanvas =  new ScanID(input, '#scan-container .scan-inner', service.scanIdOptions, false);
            };

            // function to toggle the buttons based on the id type
            service.setVisibilityForControlsButton = function( btns, id, visibilityBool ){
                for( var idx in btns ){
                    if( btns[ idx ].id === id ){
                        btns[ idx ].displayButton = visibilityBool;
                    }
                }
            }
        })
        .service('scanIdImageService', function ( $http, LOC_VARS ) {

            //var urlRoot = 'http://10.221.154.73';
            var urlRoot = 'http://10.221.155.211';
            var api = '/api/application/action/submit/partner/'+LOC_VARS.PARTNER+'/channel/'+LOC_VARS.CHANNEL+'/scanid';

            var device = {
                manufacturer: 'Other',
                model: "Other",
                testResult: getDevice()
            };

            switch( device.testResult ){
                case "ipad":
                case "iphone":
                    device.manufacturer = "Apple";
                    device.model = device.testResult;
                    break;
            }

            this.sendImageToServer = function( img, side, referenceId, documentType, documentTypeSize ){
                var formData = new FormData();

                formData.append( "scanIdImage", img );

                var jsonData = {
                    businessUnit: "sakscanada",
                    referenceId: referenceId || "",
                    manufacturer: device.manufacturer,
                    model: device.model,
                    class: documentType,
                    documentTypeSize: documentTypeSize,
                    side: side
                };
                formData.append( "scanIdDataRequest", new Blob( [ JSON.stringify( jsonData )], {
                    type: "application/json"
                }));

                return $http({
                    url: urlRoot + api,
                    method: "POST",
                    headers: {
                        "Content-Type": undefined
                    },
                    data: formData
                });
            };

            function getDevice() {
                var agents = [ 'ipad', 'iphone', 'android', 'webos', 'blackberry' ];
                for( var i in agents ) {
                    if( navigator.userAgent.match( '/' + agents[ i ] + '/i' ) ) {
                        return agents[ i ];
                    }
                }
                return false;
            }

        });
})();
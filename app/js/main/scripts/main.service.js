angular.module('govtID').service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(file, uploadUrl){
        var fd = new FormData();
        fd.append('file', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {
            	'Api-Key': 'Mobile',
				'Accept': 'application/json',
				'Content-Type': undefined,
				'Client-Correlation-Id': 'Teja',
				'Customer-IP-Address': '127.0.0.1'
            }
        })
        .success(function(res){
alert("Success"+ res)
        })
        .error(function(res){
        	alert("failure"+ res)
        });
    }
}]);
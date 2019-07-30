// SPDX-License-Identifier: Apache-2.0

'use strict';

var app = angular.module('application', []);

// Angular Controller
app.controller('appController', function($scope, appFactory){

	$("#success_update").hide();
	$("#success_set").hide();

	$("#success_create").hide();
	$("#error_create").hide();
	$("#already_created").hide();

	$("#error_update").hide();
	$("#error_set").hide();
	$("#error_query").hide();
	$("#success_update_consent").hide();
	$("#error_update_consent").hide();
	
	$scope.getAllState = function(){

		console.log("Inside getAllState of app.js function");
		var req_identity = $scope.request_identity;
		var purpose = $scope.request_purpose;

		appFactory.getAllState(purpose, req_identity, function(data){
			var array = [];
			for (var i = 0; i < data.length; i++){
				//parseInt(data[i].Key);
				console.log("Key: " + data[i].Key);
				data[i].Record.Key = data[i].Key;
				array.push(data[i].Record);
				console.log("Record: " + data[i].Record);
			}
			/*array.sort(function(a, b) {
			    return parseFloat(a.Key) - parseFloat(b.Key);
			});*/
			$scope.all_state = array;
		});
	}

	$scope.viewEhr = function(){
		console.log("Inside viewEhr function of app.js");
		var id = $scope.ehr_id;
		var req_identity = $scope.request_identity;
		var purpose = $scope.request_purpose;

		appFactory.viewEhr(id, purpose, req_identity, function(data){
			$scope.query_ehr = data;

			if ($scope.query_ehr == "The client does not have the rights to retrieve ehr related information"){
				console.log("The client does not have the rights to retrieve ehr related information");
				$("#error_query").show();
			} else{
				$("#error_query").hide();
			}
		});

		//appFactory.trackEhr(id, purpose, req_identity, "Read");
	}

	$scope.recordEhr = function(){
		console.log("Inside scope.recordEhr function");
		var req_identity = $scope.request_identity;
		var purpose = $scope.request_purpose;
		//console.log("ehr ottenuto da index.html" + $scope.toCreate.id)

		appFactory.recordEhr($scope.toCreate, purpose, req_identity, function(data){
			$scope.create_ehr = data;
			if ($scope.create_ehr == "The client does not have the rights to write the selected electronic health record or the ehr already exists"){
				console.log("The client does not have the rights to write the selected electronic health record or the ehr already exists");
				$("#success_create").hide();
				$("#error_create").show();
			} else{
				$("#error_create").hide();
				$("#success_create").show();
			}
		});

		//appFactory.trackEhr(id, purpose, req_identity, "Write");
	}

	$scope.updateEhr = function(){
		var req_identity = $scope.request_identity;
		var purpose = $scope.request_purpose;

		console.log("inside updateEhr function of app.js");

		appFactory.updateEhr($scope.toUpdate, purpose, req_identity, function(data){
			$scope.ehr_to_update = data;
			if ($scope.ehr_to_update == "The client does not have the rights to update the selected electronic health record"){
				$("#error_update").show();
				$("#success_update").hide();
			} else{
				$("#success_update").show();
				$("#error_update").hide();
			}
		});
		
		//appFactory.trackEhr(id, purpose, req_identity, "Update");
	}

	$scope.updateConsent = function(){
		var req_identity = $scope.request_identity;
		var purpose = $scope.request_purpose;

		console.log("inside updateConsent function of app.js");

		appFactory.updateConsent($scope.consentToUpdate, purpose, req_identity, function(data){
			$scope.consent_to_update = data;
			if (($scope.consent_to_update == "The client does not have the rights to update the consent in the selected electronic health record") || 
				($scope.consent_to_update == "The client does not have the attribute cf")) {
				$("#error_update_consent").show();
				$("#success_update_consent").hide();
			} else{
				$("#success_update_consent").show();
				$("#error_update_consent").hide();
			}
		});

		//appFactory.trackEhr(id, purpose, req_identity, "UpdateConsent");
	}

});

// Angular Factory
app.factory('appFactory', function($http){
	
	var factory = {};

    factory.getAllState = function(purpose, identity, callback){
		var parameters = identity + "-" + purpose;
		console.log(parameters);
    	$http.get('/get_all_state/'+parameters).success(function(output){
			callback(output)
		});
	}

	factory.viewEhr = function(id, purpose, identity, callback){
		var parameters = id + "-" + identity + "-" + purpose;
		console.log("parameters: " + parameters); 
    	$http.get('/get_ehr/'+parameters).success(function(output){
			callback(output)
		});
	}

	factory.recordEhr = function(data, purpose, identity, callback){

		console.log("Inside recordEhr factory function");

		var ehr = data.id + "-" + identity + "-" + purpose;
		console.log("EHR: " + ehr);
		//console.log("Now I should call controller.js function");

    	$http.get('/add_ehr/'+ehr).success(function(output){
			//console.log("Calling add_ehr function");
			callback(output)
		});
	}

	factory.updateEhr = function(data, purpose, identity, callback){
		console.log("Inside factory.updateEhr function")
		var ehr = data.id + "-" + identity + "-" + purpose;

    	$http.get('/update_ehr/'+ehr).success(function(output){
			callback(output)
		});
	}

	factory.updateConsent = function(data, purpose, identity, callback){
		console.log("Inside factory.updateConsent function")
		var ehr = data.id +  "-" + data.consent + "-" + identity + "-" + purpose;

    	$http.get('/update_consent/'+ehr).success(function(output){
			callback(output)
		});
	}

	factory.trackEhr = function(id, purpose, identity, action){
		console.log("Inside trackEhr function");
		var ehr = id + "-" + identity + "-" + action + "-" + purpose;

		$http.get('/track_ehr/'+ehr).success(function(output){

		});
	}

	return factory;
});



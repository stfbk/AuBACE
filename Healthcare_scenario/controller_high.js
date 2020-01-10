//SPDX-License-Identifier: Apache-2.0

/*
  This code is based on code written by the Hyperledger Fabric community.
  Original code can be found here: https://github.com/hyperledger/fabric-samples/blob/release/fabcar/query.js
  and https://github.com/hyperledger/fabric-samples/blob/release/fabcar/invoke.js
 */

// call the packages we need
var express       	= require('express');        // call express
var app           	= express();                 // define our app using express
var bodyParser    	= require('body-parser');
var http          	= require('http')
var fs            	= require('fs');
var Fabric_Client 	= require('fabric-client');
var path          	= require('path');
var util          	= require('util');
var os            	= require('os');
var dateformat 	  	= require('dateformat');

var log4js = require('log4js');
var logger = log4js.getLogger('query');
logger.setLevel('DEBUG');

const invoke = require('./app/invoke.js');
const query = require('./app/query.js');

const channelName = 'abac-channel';


/*

///////////////////////////////////////////////////////////////////////////////
///////////////////////// REST ENDPOINTS START HERE ///////////////////////////
///////////////////////////////////////////////////////////////////////////////
// Invoke transaction on chaincode on target peers
app.get('/get_all_state/:parameters', async function(req, res) {
	logger.debug('==================== get whole state ==================');
	logger.debug("Getting all Electronic Health Record from database: ");
	logger.debug("Parameters : " + req.params.parameters);
	var array = req.params.parameters.split("-");
	var identity = array[0];
	var purpose = array[1];
	logger.debug("The identity that performed the request was " + identity);
	logger.debug("The purpose was " + purpose);
	
	// pick an org based on chosen identity
	var org = getOrgByUsername;
	var orgname = `org${org}`;
	// set up client
	var username = identity;
	var client = helper.getClientForOrg (org, username);

	// invoke chaincode
	var chaincodeName = 'abac_chaincode';
	var fcn = 'getGlobalState';
	var args = [purpose];

	let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, username, orgname);
	
	res.send(message);
});
*/
module.exports = (function() {
return{
	get_all_state: async function(req, res){
		logger.debug("Getting all Electronic Health Record from database: ");
		logger.debug("Parameters : " + req.params.parameters);
		var array = req.params.parameters.split("-");
		var identity = array[0];
		var purpose = array[1];
		logger.debug("The identity that performed the request was " + identity);
		logger.debug("The purpose was " + purpose);
		
		// pick an org based on chosen identity
		var org = getOrgByUsername(identity);
		logger.debug(`UserOrg: ${org}`);
		var orgname = `org${org}`;
		// set up client -- already part of invoke

		//var client = helper.getClientForOrg (orgname, username);

		// invoke chaincode
		var chaincodeName = 'abac_chaincode';
		var fcn = 'getGlobalState';
		var args = [purpose];

		let message = await query.queryChaincode(channelName, chaincodeName, fcn, args, identity, orgname);
		res.send(message);
	},

	get_ehr: async function(req, res){
		logger.debug("getting requested ehr from database: ");
		logger.debug("Parameters: " + req.params.parameters);
		var array = req.params.parameters.split("-");
		var key = array[0];
		var identity = array[1];
		var purpose = array[2];
		logger.debug("Key: " + key);
		logger.debug("Identity: " + identity);
		logger.debug("Purpose: " + purpose);

		// pick an org based on chosen identity
		var org = getOrgByUsername(identity);
		logger.debug(`UserOrg: ${org}`);
		var orgname = `org${org}`;
		// set up client -- already part of invoke

		//var client = helper.getClientForOrg (orgname, username);

		// invoke chaincode
		var chaincodeName = 'abac_chaincode';
		var fcn = 'viewMedicalRecord';
		var args = [key, purpose];

		let message = await invoke.invokeChaincode(channelName, chaincodeName, fcn, args, identity, orgname);
		res.send(message);

	},

	update_ehr: async function(req, res){
		logger.debug("update requested for an ehr");
		logger.debug("Parameters: " + req.params.ehr);
		var array = req.params.ehr.split("-");
		var key = array[0];
		var identity = array[1];
		var purpose = array[2];
		logger.debug("Key: " + key);
		logger.debug("Identity: " + identity);
		logger.debug("Purpose: " + purpose);

		// pick an org based on chosen identity
		var org = getOrgByUsername(identity);
		logger.debug(`UserOrg: ${org}`);
		var orgname = `org${org}`;
		// set up client -- already part of invoke

		//var client = helper.getClientForOrg (orgname, username);

		// invoke chaincode
		var chaincodeName = 'abac_chaincode';
		var fcn = 'updateMedicalRecord';
		var args = [key, purpose];

		let message = await invoke.invokeChaincode(channelName, chaincodeName, fcn, args, identity, orgname);
		res.send(message);

	},

	add_ehr: async function(req, res){
		logger.debug("submit recording of a ehr: ");

		var array = req.params.ehr.split("-");
		logger.debug(array);

		var key = array[0];
		var identity = array[1];
		var purpose = array[2];

		logger.debug("The identity selected is " + identity);
		logger.debug("The purpose selected is " + purpose);

		// pick an org based on chosen identity
		var org = getOrgByUsername(identity);
		logger.debug(`UserOrg: ${org}`);
		var orgname = `org${org}`;
		// set up client -- already part of invoke

		//var client = helper.getClientForOrg (orgname, username);

		// invoke chaincode
		var chaincodeName = 'abac_chaincode';
		var fcn = 'addMedicalRecord';
		var args = [key, purpose];

		let message = await invoke.invokeChaincode(channelName, chaincodeName, fcn, args, identity, orgname);
		res.send(message);

	},

	update_consent: async function(req, res){
		logger.debug("updating consent for an electronic health record: ");

		var array = req.params.ehr.split("-");

		var key = array[0];
		var consent = array[1];
		var identity = array[2];
		var purpose = array[3];
		//var now = new Date();
		//dateformat.masks.completeTime = "dd/mm/yyyy, HH:MM:ss";

		logger.debug(key + " - " + consent + " - " + identity + "-" + purpose);

		// pick an org based on chosen identity
		var org = getOrgByUsername(identity);
		logger.debug(`UserOrg: ${org}`);
		var orgname = `org${org}`;
		// set up client -- already part of invoke

		//var client = helper.getClientForOrg (orgname, username);

		// invoke chaincode
		var chaincodeName = 'abac_chaincode';
		var fcn = 'updateConsent';
		var args = [key, consent, purpose];

		let message = await invoke.invokeChaincode(channelName, chaincodeName, fcn, args, identity, orgname);
		res.send(message);
	},

	track_ehr: async function(req, res){
		logger.debug("tracking activity on health record: ");

		var array = req.params.ehr.split("-");

		var key = array[0];
		var identity = array[1];
		var action = array[2];
		var purpose = array[3];
		var now = new Date();
		dateformat.masks.completeTime = "dd/mm/yyyy, HH:MM:ss";

		logger.debug(key + " - " + identity + " - " + action);

		// pick an org based on chosen identity
		var org = getOrgByUsername(identity);
		logger.debug(`UserOrg: ${org}`);
		var orgname = `org${org}`;
		// set up client -- already part of invoke

		//var client = helper.getClientForOrg (orgname, username);

		// invoke chaincode
		var chaincodeName = 'abac_chaincode';
		var fcn = 'trackMedicalRecord';
		var args = [key, identity, action, dateformat(now, "completeTime"), purpose];

		let message = await invoke.invokeChaincode(channelName, chaincodeName, fcn, args, identity, orgname);
		res.send(message);

	},

	get_all_state_no_eval: async function(req, res){
		logger.debug("Getting all Electronic Health Record from database: ");
		logger.debug("Parameters : " + req.params.parameters);
		var array = req.params.parameters.split("-");
		var identity = array[0];
		logger.debug("The identity that performed the request was " + identity);
		
		// pick an org based on chosen identity
		var org = getOrgByUsername(identity);
		logger.debug(`UserOrg: ${org}`);
		var orgname = `org${org}`;
		// set up client -- already part of invoke

		//var client = helper.getClientForOrg (orgname, username);

		// invoke chaincode
		var chaincodeName = 'abac_chaincode';
		var fcn = 'getGlobalStateNoEval';
		var args = [];

		let message = await invoke.invokeChaincode(channelName, chaincodeName, fcn, args, identity, orgname);
		res.send(message);
	},

	get_ehr_no_eval: async function(req, res){
		logger.debug("getting requested ehr from database: ");
		logger.debug("Parameters: " + req.params.parameters);
		var array = req.params.parameters.split("-");
		var key = array[0];
		var identity = array[1];
		logger.debug("Key: " + key);
		logger.debug("Identity: " + identity);
		
		// pick an org based on chosen identity
		var org = getOrgByUsername(identity);
		logger.debug(`UserOrg: ${org}`);
		var orgname = `org${org}`;
		// set up client -- already part of invoke

		//var client = helper.getClientForOrg (orgname, username);

		// invoke chaincode
		var chaincodeName = 'abac_chaincode';
		var fcn = 'viewMedicalRecordNoEval';
		var args = [key];

		let message = await invoke.invokeChaincode(channelName, chaincodeName, fcn, args, identity, orgname);
		res.send(message);
	},
	update_ehr_no_eval: async function(req, res){
		logger.debug("update requested for an ehr");
		logger.debug("Parameters: " + req.params.ehr);
		var array = req.params.ehr.split("-");
		var key = array[0];
		var identity = array[1];
		logger.debug("Key: " + key);
		logger.debug("Identity: " + identity);

		// pick an org based on chosen identity
		var org = getOrgByUsername(identity);
		logger.debug(`UserOrg: ${org}`);
		var orgname = `org${org}`;
		// set up client -- already part of invoke

		//var client = helper.getClientForOrg (orgname, username);

		// invoke chaincode
		var chaincodeName = 'abac_chaincode';
		var fcn = 'updateMedicalRecordNoEval';
		var args = [key];

		let message = await invoke.invokeChaincode(channelName, chaincodeName, fcn, args, identity, orgname);
		res.send(message);

	},
	add_ehr_no_eval: async function(req, res){
		logger.debug("submit recording of a ehr: ");

		var array = req.params.ehr.split("-");
		logger.debug(array);

		var key = array[0];
		var identity = array[1];

		logger.debug("The identity selected is " + identity);

		// pick an org based on chosen identity
		var org = getOrgByUsername(identity);
		logger.debug(`UserOrg: ${org}`);
		var orgname = `org${org}`;
		// set up client -- already part of invoke

		//var client = helper.getClientForOrg (orgname, username);

		// invoke chaincode
		var chaincodeName = 'abac_chaincode';
		var fcn = 'addMedicalRecordNoEval';
		var args = [key];

		let message = await invoke.invokeChaincode(channelName, chaincodeName, fcn, args, identity, orgname);
		res.send(message);
	},
	update_consent_no_eval: async function(req, res){
		logger.debug("updating consent for an electronic health record: ");

		var array = req.params.ehr.split("-");

		var key = array[0];
		var consent = array[1];
		var identity = array[2];
		//var now = new Date();
		//dateformat.masks.completeTime = "dd/mm/yyyy, HH:MM:ss";

		logger.debug(key + " - " + consent + " - " + identity );

		// pick an org based on chosen identity
		var org = getOrgByUsername(identity);
		logger.debug(`UserOrg: ${org}`);
		var orgname = `org${org}`;
		// set up client -- already part of invoke

		//var client = helper.getClientForOrg (orgname, username);

		// invoke chaincode
		var chaincodeName = 'abac_chaincode';
		var fcn = 'updateConsentNoEval';
		var args = [key, consent];

		let message = await invoke.invokeChaincode(channelName, chaincodeName, fcn, args, identity, orgname);
		res.send(message);
		
	},
	track_ehr_no_eval: async function(req, res){
		logger.debug("tracking activity on health record: ");

		var array = req.params.ehr.split("-");

		var key = array[0];
		var identity = array[1];
		var action = array[2];
		var now = new Date();
		dateformat.masks.completeTime = "dd/mm/yyyy, HH:MM:ss";

		logger.debug(key + " - " + identity + " - " + action);

		// pick an org based on chosen identity
		var org = getOrgByUsername(identity);
		logger.debug(`UserOrg: ${org}`);
		var orgname = `org${org}`;
		// set up client -- already part of invoke

		//var client = helper.getClientForOrg (orgname, username);

		// invoke chaincode
		var chaincodeName = 'abac_chaincode';
		var fcn = 'trackMedicalRecordNoEval';
		var args = [key, identity, action, dateformat(now, "completeTime")];

		let message = await invoke.invokeChaincode(channelName, chaincodeName, fcn, args, identity, orgname);
		res.send(message);

	}
	
}
})();


function getOrgByUsername(username){
	var org;
	switch (username){
		case 'doctor1': 
		case 'data1':
		case 'nurse1':
		case 'patient1':
		case 'patient2': 
		case 'patient3': 
		case 'patient4': 
		case 'patient5':
		case 'patient6':
		case 'patient7':
		case 'patient8':
		case 'patient9':
		case 'patient10':
		case 'patient11':
		case 'patient12':
		case 'patient13':
		case 'patient14':
		case 'patient15':
		case 'patient16':
		case 'patient17':
		case 'patient18':
		case 'patient19':
		case 'patient20':
		case 'patient21':
		case 'patient22':
		case 'patient23':
		case 'patient24':
		case 'patient25':
		case 'patient26':
		case 'patient27':
		case 'patient28':
		case 'patient29':
		case 'patient30':
		case 'patient31':
		case 'patient32':
		case 'patient33':
		case 'patient34':
		case 'patient35':
		case 'patient36':
		case 'patient37':
		case 'patient38':
		case 'patient39':
		case 'patient40':
		case 'patient41':
		case 'patient42':
		case 'patient43':
		case 'patient44':
		case 'patient45':
		case 'patient46':
		case 'patient47':
		case 'patient48':
		case 'patient49':
		case 'patient50':
		case 'patient51':
		case 'patient52':
		case 'patient53':
		case 'patient54':
		case 'patient55':
		case 'patient56':
		case 'patient57':
		case 'patient58':
		case 'patient59':
		case 'patient60':
		case 'patient61':
		case 'patient62':
		case 'patient63':
		case 'patient64':
		case 'patient65':
		case 'patient66':
		case 'patient67':
		case 'patient68':
		case 'patient69':
		case 'patient70':
		case 'patient71':
		case 'patient72':
		case 'patient73':
		case 'patient74':
		case 'patient75':
		case 'patient76':
		case 'patient77':
		case 'patient78':
		case 'patient79':
		case 'patient80':
		case 'patient81':
		case 'patient82':
		case 'patient83':
		case 'patient84':
		case 'patient85':
		case 'patient86':
		case 'patient87':
		case 'patient88':
		case 'patient89':
		case 'patient90':
		case 'patient91':
		case 'patient92':
		case 'patient93':
		case 'patient94':
		case 'patient95':
		case 'patient96':
		case 'patient97':
		case 'patient98':
		case 'patient99':
		case 'patient100':
		case 'emergency1':
						org = 1;
						break;
		case 'doctor2': 
		case 'nurse2':
						org = 2;
						break;
		case 'nurse3': 
						org = 3;
						break;
	}
	return org;
}

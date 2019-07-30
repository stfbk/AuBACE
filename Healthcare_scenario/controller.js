//SPDX-License-Identifier: Apache-2.0

/*
  This code is based on code written by the Hyperledger Fabric community.
  Original code can be found here: https://github.com/hyperledger/fabric-samples/blob/release/fabcar/query.js
  and https://github.com/hyperledger/fabric-samples/blob/release/fabcar/invoke.js
 */

// call the packages we need
var express       = require('express');        // call express
var app           = express();                 // define our app using express
var bodyParser    = require('body-parser');
var http          = require('http')
var fs            = require('fs');
var Fabric_Client = require('fabric-client');
var path          = require('path');
var util          = require('util');
var os            = require('os');
var dateformat 	  = require('dateformat');

const peerData1 = fs.readFileSync('./crypto-config/peerOrganizations/org1.example.com/msp/tlscacerts/tlsca.org1.example.com-cert.pem');
const peerData2 = fs.readFileSync('./crypto-config/peerOrganizations/org2.example.com/msp/tlscacerts/tlsca.org2.example.com-cert.pem');
const peerData3 = fs.readFileSync('./crypto-config/peerOrganizations/org3.example.com/msp/tlscacerts/tlsca.org3.example.com-cert.pem');
const ordererData = fs.readFileSync('./crypto-config/ordererOrganizations/fbk.eu/msp/tlscacerts/tlsca.fbk.eu-cert.pem');
const store_path = path.join(os.homedir(), '.hfc-key-store');
console.log('Store path:'+store_path);

module.exports = (function() {
return{
	get_all_state: function(req, res){
		console.log("Getting all Electronic Health Record from database: ");
		console.log("Parameters : " + req.params.parameters);
		var array = req.params.parameters.split("-");
		var identity = array[0];
		var purpose = array[1];
		console.log("The identity that performed the request was " + identity);
		console.log("The purpose was " + purpose);
		
		clientPromise(identity)
		.then((fabric_client) => {
			// txId is cound to the context (hash includes client identity)
			var tx_id = fabric_client.newTransactionID();

			var request = {
					chaincodeId: 'abac_chaincode',
					//txId: tx_id,
					fcn: 'getGlobalState',
					args: [purpose],
					chainId: 'abac-channel'
				};

			query_handler(fabric_client, request, res);

		});
		
	},
	get_ehr: function(req, res){
		console.log("getting requested ehr from database: ");
		console.log("Parameters: " + req.params.parameters);
		var array = req.params.parameters.split("-");
		var key = array[0];
		var identity = array[1];
		var purpose = array[2];
		console.log("Key: " + key);
		console.log("Identity: " + identity);
		console.log("Purpose: " + purpose);
		
		clientPromise(identity)
		.then((fabric_client) => {
			//var channel = fabric_client.getChannel('abac-channel');
			var tx_id = fabric_client.newTransactionID();

			var request = {
			    //targets : --- letting this default to the peers assigned to the channel
			    chaincodeId: 'abac_chaincode',
			    fcn: 'viewMedicalRecord',
			    args: [key, purpose],
			    chainId: 'abac-channel',
			    txId: tx_id
			};
			invoke_handler(fabric_client, request, res);

		});

	},
	update_ehr: function(req, res){
		console.log("update requested for an ehr");
		console.log("Parameters: " + req.params.ehr);
		var array = req.params.ehr.split("-");
		var key = array[0];
		var identity = array[1];
		var purpose = array[2];
		console.log("Key: " + key);
		console.log("Identity: " + identity);
		console.log("Purpose: " + purpose);

		clientPromise(identity)
		.then((fabric_client) => {
			var channel = fabric_client.getChannel('abac-channel');
			var tx_id = fabric_client.newTransactionID();

			var request = {
					chaincodeId: 'abac_chaincode',
					txId: tx_id,
					fcn: 'updateMedicalRecord',
					args: [key, purpose],
					chainId: 'abac-channel'
				};

			invoke_handler(fabric_client, request, res);

		});

	},
	add_ehr: function(req, res){
		console.log("submit recording of a ehr: ");

		var array = req.params.ehr.split("-");
		console.log(array);

		var key = array[0];
		var identity = array[1];
		var purpose = array[2];

		console.log("The identity selected is " + identity);
		console.log("The purpose selected is " + purpose);

		clientPromise(identity)
		.then((fabric_client) => {
			//var channel = fabric_client.getChannel('abac-channel');
			var tx_id = fabric_client.newTransactionID();

			var request = {
			    //targets : --- letting this default to the peers assigned to the channel
			    chaincodeId: 'abac_chaincode',
			    fcn: 'addMedicalRecord',
			    args: [key, purpose],
			    chainId: 'abac-channel',
			    txId: tx_id
			};
			invoke_handler(fabric_client, request, res);

		});

	},
	update_consent: function(req, res){
		console.log("updating consent for an electronic health record: ");

		var array = req.params.ehr.split("-");

		var key = array[0];
		var consent = array[1];
		var identity = array[2];
		var purpose = array[3];
		/*var now = new Date();
		dateformat.masks.completeTime = "dd/mm/yyyy, HH:MM:ss";*/

		console.log(key + " - " + consent + " - " + identity + "-" + purpose);

		clientPromise(identity)
		.then((fabric_client) => {
			//var fabric_client = clientSetup(identity);

			// get a transaction id object based on the current user assigned to fabric client
			var tx_id = fabric_client.newTransactionID();
			console.log("Assigning transaction_id: ", tx_id._transaction_id);

			var request = {
				//targets : --- letting this default to the peers assigned to the channel
				chaincodeId: 'abac_chaincode',
				fcn: 'updateConsent',
				args: [key, consent, purpose],
				chainId: 'abac-channel',
				txId: tx_id
			};

			invoke_handler(fabric_client, request, res);
		});
	},
	track_ehr: function(req, res){
		console.log("tracking activity on health record: ");

		var array = req.params.ehr.split("-");

		var key = array[0];
		var identity = array[1];
		var action = array[2];
		var purpose = array[3];
		var now = new Date();
		dateformat.masks.completeTime = "dd/mm/yyyy, HH:MM:ss";

		console.log(key + " - " + identity + " - " + action);

		clientPromise(identity)
		.then((fabric_client) => {
			var channel = fabric_client.getChannel('abac-channel');
			var tx_id = fabric_client.newTransactionID();

			var request = {
					chaincodeId: 'abac_chaincode',
					txId: tx_id,
					fcn: 'trackMedicalRecord',
					args: [key, identity, action, dateformat(now, "completeTime"), purpose],
					chainId: 'abac-channel'
				};

			invoke_handler(fabric_client, request, res);

		});

	},

	get_all_state_no_eval: function(req, res){
		console.log("Getting all Electronic Health Record from database: ");
		console.log("Parameters : " + req.params.parameters);
		var array = req.params.parameters.split("-");
		var identity = array[0];
		console.log("The identity that performed the request was " + identity);
		
		clientPromise(identity)
		.then((fabric_client) => {
			var channel = fabric_client.getChannel('abac-channel');
			var tx_id = fabric_client.newTransactionID();

			var request = {
					chaincodeId: 'abac_chaincode',
					txId: tx_id,
					fcn: 'getGlobalStateNoEval',
					args: [],
					chainId: 'abac-channel'
				};

			query_handler(fabric_client, request, res);

		});
	},
	get_ehr_no_eval: function(req, res){
		console.log("getting requested ehr from database: ");
		console.log("Parameters: " + req.params.parameters);
		var array = req.params.parameters.split("-");
		var key = array[0];
		var identity = array[1];
		console.log("Key: " + key);
		console.log("Identity: " + identity);
		
		clientPromise(identity)
		.then((fabric_client) => {
			//var channel = fabric_client.getChannel('abac-channel');
			var tx_id = fabric_client.newTransactionID();

			var request = {
					chaincodeId: 'abac_chaincode',
					txId: tx_id,
					fcn: 'viewMedicalRecordNoEval',
					args: [key],
					chainId: 'abac-channel'
				};

			invoke_handler(fabric_client, request, res);

		});
	},
	update_ehr_no_eval: function(req, res){
		console.log("update requested for an ehr");
		console.log("Parameters: " + req.params.ehr);
		var array = req.params.ehr.split("-");
		var key = array[0];
		var identity = array[1];
		console.log("Key: " + key);
		console.log("Identity: " + identity);

		clientPromise(identity)
		.then((fabric_client) => {
			//var channel = fabric_client.getChannel('abac-channel');
			var tx_id = fabric_client.newTransactionID();

			var request = {
					chaincodeId: 'abac_chaincode',
					txId: tx_id,
					fcn: 'updateMedicalRecordNoEval',
					args: [key],
					chainId: 'abac-channel'
				};

			invoke_handler(fabric_client, request, res);

		});

	},
	add_ehr_no_eval: function(req, res){
		console.log("submit recording of a ehr: ");

		var array = req.params.ehr.split("-");
		console.log(array);

		var key = array[0];
		var identity = array[1];

		console.log("The identity selected is " + identity);

		clientPromise(identity)
		.then((fabric_client) => {
			//var channel = fabric_client.getChannel('abac-channel');
			var tx_id = fabric_client.newTransactionID();

			var request = {
					chaincodeId: 'abac_chaincode',
					txId: tx_id,
					fcn: 'addMedicalRecordNoEval',
					args: [key],
					chainId: 'abac-channel'
				};

			invoke_handler(fabric_client, request, res);

		});
	},
	update_consent_no_eval: function(req, res){
		console.log("updating consent for an electronic health record: ");

		var array = req.params.ehr.split("-");

		var key = array[0];
		var consent = array[1];
		var identity = array[2];
		/*var now = new Date();
		dateformat.masks.completeTime = "dd/mm/yyyy, HH:MM:ss";*/

		console.log(key + " - " + consent + " - " + identity );

		clientPromise(identity)
		.then((fabric_client) => {
			//var channel = fabric_client.getChannel('abac-channel');
			var tx_id = fabric_client.newTransactionID();

			var request = {
					chaincodeId: 'abac_chaincode',
					txId: tx_id,
					fcn: 'updateConsentNoEval',
					args: [key, consent],
					chainId: 'abac-channel'
				};

			invoke_handler(fabric_client, request, res);

		});
		
	},
	track_ehr_no_eval: function(req, res){
		console.log("tracking activity on health record: ");

		var array = req.params.ehr.split("-");

		var key = array[0];
		var identity = array[1];
		var action = array[2];
		var now = new Date();
		dateformat.masks.completeTime = "dd/mm/yyyy, HH:MM:ss";

		console.log(key + " - " + identity + " - " + action);

		clientPromise(identity)
		.then((fabric_client) => {
			//var channel = fabric_client.getChannel('abac-channel');
			var tx_id = fabric_client.newTransactionID();

			var request = {
					chaincodeId: 'abac_chaincode',
					txId: tx_id,
					fcn: 'trackMedicalRecordNoEval',
			    	args: [key, identity, action, dateformat(now, "completeTime")],
					chainId: 'abac-channel'
				};

			invoke_handler(fabric_client, request, res);

		});

	}

}
})();

function invoke_handler(fabric_client, request, res){

	var channel = fabric_client.getChannel('abac-channel');
	var tx_id_string = request.txId.getTransactionID();
	// send the query proposal to the peer
	channel.sendTransactionProposal(request)
	.then((results) => {
	    var proposalResponses = results[0];
		var proposal = results[1];
		let isProposalGood = false;
	    if (proposalResponses && proposalResponses[0].response &&
	        proposalResponses[0].response.status === 200) {
	            isProposalGood = true;
	            console.log('Transaction proposal was good');
	        } else {
	            console.error('Transaction proposal was bad');
			}
	    if (isProposalGood) {
	        console.log(util.format(
	            'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
	            proposalResponses[0].response.status, proposalResponses[0].response.message));
			console.log(proposalResponses[0].response.payload.toString());

	        // build up the request for the orderer to have the transaction committed
	        var tx = {
	            proposalResponses: proposalResponses,
	            proposal: proposal
	        };

	        // set the transaction listener and set a timeout of 30 sec
	        // if the transaction did not get committed within the timeout period,
	        // report a TIMEOUT status
	        
	        var promises = [];

	        var sendPromise = channel.sendTransaction(tx);
	        promises.push(sendPromise); //we want the send transaction first, so that we know where to check status

	        // get an eventhub once the fabric client has a user assigned. The user
	        // is required bacause the event registration must be signed
	        let event_hub = fabric_client.newEventHub();
	        event_hub.setPeerAddr('grpcs://localhost:7053', {pem: Buffer.from(peerData1).toString(), 'ssl-target-name-override': 'peer0.org1.example.com'});

	        // using resolve the promise so that result status may be processed
	        // under the then clause rather than having the catch clause process
	        // the status
	        let txPromise = new Promise((resolve, reject) => {
	            let handle = setTimeout(() => {
	                event_hub.disconnect();
	                resolve({event_status : 'TIMEOUT'}); //we could use reject(new Error('Trnasaction did not complete within 30 seconds'));
	            }, 3000);
	            event_hub.connect();
	            event_hub.registerTxEvent(tx_id_string, (tx, code) => {
	                // this is the callback for transaction event status
	                // first some clean up of event listener
	                clearTimeout(handle);
	                event_hub.unregisterTxEvent(tx_id_string);
	                event_hub.disconnect();

	                // now let the application know what happened
	                var return_status = {event_status : code, tx_id : tx_id_string};
	                if (code !== 'VALID') {
	                    console.error('The transaction was invalid, code = ' + code);
	                    resolve(return_status); // we could use reject(new Error('Problem with the tranaction, event status ::'+code));
	                } else {
	                    console.log('The transaction has been committed on peer ' + event_hub._ep._endpoint.addr);
	                    resolve(return_status);
	                }
	            }, (err) => {
	                //this is the callback if something goes wrong with the event registration or processing
	                reject(new Error('There was a problem with the eventhub ::'+err));
	            });
	        });
	        promises.push(txPromise);

	        return Promise.all(promises);
	    } else {
	        console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
			throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
	    }
	}).then((results) => {
	    console.log('Send transaction promise and event listener promise have completed');
	    // check the results in the order the promises were added to the promise all list
	    if (results && results[0] && results[0].status === 'SUCCESS') {
	        console.log('Successfully sent transaction to the orderer.');
	        res.send(tx_id_string);
	    } else {
	        console.error('Failed to order the transaction. Error code: ' + response.status);
	    }

	    if(results && results[1] && results[1].event_status === 'VALID') {
	        console.log('Successfully committed the change to the ledger by the peer');
	        res.send(tx_id_string);
	    } else {
	        console.log('Transaction failed to be committed to the ledger due to ::'+results[1].event_status);
	    }
	}).catch((err) => {
		console.error('Failed to invoke successfully :: ' + err);
		res.send("The client does not have the rights to perform the request.");
	});

}

function query_handler(fabric_client, request, res){

	var channel = fabric_client.getChannel('abac-channel');

	// send the query proposal to the peer
	channel.queryByChaincode(request
	).then((query_responses) => {
		console.log("Query has completed, checking results");
		// query_responses could have more than one  results if there multiple peers were used as targets
		if (query_responses && query_responses.length >= 1) {
			if (query_responses[0] instanceof Error) {
			    console.error("error from query = ", query_responses[0]);
			    //E.g.: "{ Error: 2 UNKNOWN: chaincode error (status: 500, message: The client does not have the rights to write the selected electronic health record)"
			    res.json("{\"Message\":\""+query_responses[0].toString()+"\"}");
			} else {
			    console.log("Response [0] is ", query_responses[0].toString());
			    res.json(JSON.parse(query_responses[0].toString()));
				for(let i = 0; i < query_responses.length; i++) {
					console.log(util.format('Query result from peer [%s]: %s', i, query_responses[i].toString('utf8')));
				}
			}
		} else {
			console.log("No payloads were returned from query");
		}
	}).catch((err) => {
		console.error('Failed to query successfully :: ' + err);
	});
}

function clientPromise(identity){
	
	return new Promise(function(resolve, reject) {
		var fabric_client = new Fabric_Client();

		var peer0_org1 = fabric_client.newPeer('grpcs://localhost:7051', {pem: Buffer.from(peerData1).toString(), 'ssl-target-name-override': 'peer0.org1.example.com'});
		
		var peer0_org2 = fabric_client.newPeer('grpcs://localhost:8051', {pem: Buffer.from(peerData2).toString(), 'ssl-target-name-override': 'peer0.org2.example.com'});

		var peer0_org3 = fabric_client.newPeer('grpcs://localhost:9051', {pem: Buffer.from(peerData3).toString(), 'ssl-target-name-override': 'peer0.org3.example.com'});
/*
		var peer1_org1 = fabric_client.newPeer('grpcs://localhost:7056', {pem: Buffer.from(peerData1).toString(), 'ssl-target-name-override': 'peer1.org1.example.com'});

		var peer1_org2 = fabric_client.newPeer('grpcs://localhost:8056', {pem: Buffer.from(peerData2).toString(), 'ssl-target-name-override': 'peer1.org2.example.com'});

		var peer1_org3 = fabric_client.newPeer('grpcs://localhost:9056', {pem: Buffer.from(peerData3).toString(), 'ssl-target-name-override': 'peer1.org3.example.com'});
*/
		var channel = fabric_client.newChannel('abac-channel')

		var order = fabric_client.newOrderer('grpcs://localhost:7050', {pem: Buffer.from(ordererData).toString(), 'ssl-target-name-override': 'orderer.fbk.eu'});
		channel.addOrderer(order);

		channel.addPeer(peer0_org1);
		channel.addPeer(peer0_org2);
		channel.addPeer(peer0_org3);
		//channel.addPeer(peer1_org1);
		//channel.addPeer(peer1_org2);
		//channel.addPeer(peer1_org3);

		// assign the store to the fabric client
		Fabric_Client.newDefaultKeyValueStore({ path: store_path
			}).then((state_store) => {
			fabric_client.setStateStore(state_store);
			var crypto_suite = Fabric_Client.newCryptoSuite();
			// use the same location for the state store (where the users' certificate are kept)
			// and the crypto store (where the users' keys are kept)
			var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
			crypto_suite.setCryptoKeyStore(crypto_store);
			fabric_client.setCryptoSuite(crypto_suite);
			return fabric_client.getUserContext(identity, true);
		}).then((user_from_store) => {
			if (user_from_store && user_from_store.isEnrolled()) {
				console.log('Successfully loaded ' + identity + ' from persistence');
				resolve(fabric_client);
			} else {
				reject(new Error('Failed to get ' + identity + ' .... run registerUser.js'));
			}
		});

	});
	
}



function selectIdentity(identity, fabric_client){
	var config = {};
	switch (identity){
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
						config.store_path = path.join(os.homedir(), '.hfc-key-store'); 
						config.peerData = fs.readFileSync('./crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp/tlscacerts/tlsca.org1.example.com-cert.pem')
						config.peer = fabric_client.newPeer('grpcs://localhost:7051', {pem: Buffer.from(config.peerData).toString(), 'ssl-target-name-override': 'peer0.org1.example.com'});
						break;
		case 'doctor2': 
		case 'nurse2':
						config.store_path = path.join(os.homedir(), '.hfc-key-store'); 
						config.peerData = fs.readFileSync('./crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/msp/tlscacerts/tlsca.org2.example.com-cert.pem')
						config.peer = fabric_client.newPeer('grpcs://localhost:8051', {pem: Buffer.from(config.peerData).toString(), 'ssl-target-name-override': 'peer0.org2.example.com'});
						break;
		case 'nurse3': 
						config.store_path = path.join(os.homedir(), '.hfc-key-store'); 
						config.peerData = fs.readFileSync('./crypto-config/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/msp/tlscacerts/tlsca.org3.example.com-cert.pem')
						config.peer = fabric_client.newPeer('grpcs://localhost:9051', {pem: Buffer.from(config.peerData).toString(), 'ssl-target-name-override': 'peer0.org3.example.com'});
						break;
	}
	console.log(config);
	return config;
}

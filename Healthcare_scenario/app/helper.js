/**
 * Copyright 2017 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an 'AS IS' BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('Helper');
logger.setLevel('DEBUG');

var path = require('path');
var util = require('util');

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
var hfc = require('fabric-client');
hfc.setLogger(logger);

async function getClientForOrg (userorg, username) {
	logger.debug('getClientForOrg - ****** START %s %s', userorg, username)
	

	// build a client context and load it with a connection profile
	// lets only load the network settings and save the client for later
	// Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), `wallet`, `${userorg}`);
	var ccpPath = path.join(process.cwd(), `client_config_common.yaml`);
    const wallet = new FileSystemWallet(walletPath);
    logger.debug(`Wallet path: ${walletPath}`);

	// Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccpPath, { wallet, identity: username, discovery: { enabled: true, asLocalhost: true } });

    // Get the CA client object from the gateway for interacting with the CA.
    var client = gateway.getClient();

	
	logger.debug('getClientForOrg - ****** END %s %s \n\n', userorg, username)

	return client;
}


var getLogger = function(moduleName) {
	var logger = log4js.getLogger(moduleName);
	logger.setLevel('DEBUG');
	return logger;
};

exports.getClientForOrg = getClientForOrg;
exports.getLogger = getLogger;

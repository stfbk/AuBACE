/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

var log4js = require('log4js');
var logger = log4js.getLogger('query');
logger.setLevel('DEBUG');

const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');

const queryChaincode = async function(channelName, chaincodeName, fcn, args, userName, orgName) {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet', orgName);
        const wallet = new FileSystemWallet(walletPath);
		const ccpPath = path.resolve(process.cwd(), 'client_config_common.yaml');//`connection-${orgName}.json`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(userName);
        if (!userExists) {
            logger.error(`An identity for the user ${userName} does not exist in the wallet`);
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: userName, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract = network.getContract(chaincodeName);

        // Submit the specified transaction.
        const response = await contract.submitTransaction(fcn, ...args);
        logger.debug('Transaction has been submitted');
		logger.debug(`Response: ${response}`)
        // Disconnect from the gateway.
        await gateway.disconnect();
		logger.debug(`Gateway disconnected`);
		return response;
    } catch (error) {
        logger.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }

	
};

exports.queryChaincode = queryChaincode;

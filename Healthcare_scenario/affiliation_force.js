/*
 * SPDX-License-Identifier: Apache-2.0
 */

var org = process.argv[2]
var affiliation = process.argv[3];

'use strict';

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '.', `connection-org${org}.json`);

async function main() {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), `wallet`, `org${org}`);
        const wallet = new FileSystemWallet(walletPath);
        console.debug(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists(`admin`);
        if (!adminExists) {
            console.log(`An identity for the admin user "admin" does not exist in the org${org} wallet`);
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: `admin`, discovery: { enabled: true, asLocalhost: true } });

        // Get the CA client object from the gateway for interacting with the CA.
        const caClient = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

		const AS = await caClient.newAffiliationService();

		var create = await AS.create({ "name": `org${org}.${affiliation}` , "force": true}, adminIdentity);
		console.debug(create);
		
 } catch (error) {
        console.error(`Failed to register affiliation "org${org}.${affiliation}": ${error}`);
        process.exit(1);
    }
}

main();


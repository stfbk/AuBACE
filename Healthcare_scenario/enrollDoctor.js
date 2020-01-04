/*
 * SPDX-License-Identifier: Apache-2.0
 */

var org = process.argv[2]
var name = "doctor";
var number = process.argv[3];
userString = name+number;

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
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(userString);
        if (userExists) {
            console.log(`An identity for the user "${userString}" already exists in the org${org} wallet`);
            return;
        }

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
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({ affiliation: `org${org}.department1`, enrollmentID: userString, role: 'client', attrs: [{name: 'role', value: 'General_Practitioner', ecert: true}] }, adminIdentity);
        const enrollment = await ca.enroll({ enrollmentID: userString, enrollmentSecret: secret, attr_reqs: [{name: 'role'}] });
        const userIdentity = X509WalletMixin.createIdentity(`Org${org}MSP`, enrollment.certificate, enrollment.key.toBytes());
        await wallet.import(userString, userIdentity);
        console.log(`Successfully registered and enrolled client user "${userString}" and imported it into the org${org} wallet`);

    } catch (error) {
        console.error(`Failed to register user "${userString}": ${error}`);
        process.exit(1);
    }
}

main();

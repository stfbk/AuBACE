#!/bin/bash

echo
echo " ____    _____      _      ____    _____ "
echo "/ ___|  |_   _|    / \    |  _ \  |_   _|"
echo "\___ \    | |     / _ \   | |_) |   | |  "
echo " ___) |   | |    / ___ \  |  _ <    | |  "
echo "|____/    |_|   /_/   \_\ |_| \_\   |_|  "
echo
echo "ABAC Network Setup"
echo
CHANNEL_NAME="$1"
DELAY="$2"
LANGUAGE="$3"
TIMEOUT="$4"
VERBOSE="$5"
NO_CHAINCODE="$6"
: ${CHANNEL_NAME:="abac-channel"}
: ${DELAY:="3"}
: ${LANGUAGE:="golang"}
: ${TIMEOUT:="10"}
: ${VERBOSE:="false"}
: ${NO_CHAINCODE:="false"}
LANGUAGE=`echo "$LANGUAGE" | tr [:upper:] [:lower:]`
COUNTER=1
MAX_RETRY=3

CC_SRC_PATH_EHR="github.com/chaincode/src/ehr/"
CC_SRC_PATH_POLICY="github.com/chaincode/src/policy/"


echo "Channel name : "$CHANNEL_NAME
echo "Delay : "$DELAY

# import utils
. scripts/utils.sh


createChannel() {
	setGlobals 0 1

	if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
                set -x
		peer channel create -o orderer.fbk.eu:7050 -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx >&log.txt
		res=$?
                set +x
	else
				set -x
		peer channel create -o orderer.fbk.eu:7050 -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA >&log.txt
		res=$?
				set +x
	fi
	cat log.txt
	verifyResult $res "Channel creation failed"
	echo "===================== Channel '$CHANNEL_NAME' created ===================== "
	echo
}

joinChannel () {
    for org in 1 2 3; do
	    for peer in 0 1; do
		joinChannelWithRetry $peer $org
		echo "===================== peer${peer}.org${org} joined channel '$CHANNEL_NAME' ===================== "
		sleep $DELAY
		echo
	    done
	done
}





callInit () {
	PEER1=$1
	setGlobals $PEER1

	if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
		peer chaincode invoke -o orderer.fbk.eu:7050 -C $CHANNEL_NAME -n abac_chaincode -c '{"function":"init","Args":[]}' >&log.txt
		peer chaincode invoke -o orderer.fbk.eu:7050 -C $CHANNEL_NAME -n policy_chaincode -c '{"function":"init","Args":[]}' >&log.txt
	else
		peer chaincode invoke -o orderer.fbk.eu:7050  --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n abac_chaincode -c '{"function":"init","Args":[]}' >&log.txt
		peer chaincode invoke -o orderer.fbk.eu:7050  --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n policy_chaincode -c '{"function":"init","Args":[]}' >&log.txt
		
	fi
	res=$?
	cat log.txt
	verifyResult $res "Invoke execution on PEER$PEER failed "
	echo "===================== Invoke transaction on PEER$PEER on channel '$CHANNEL_NAME' is successful ===================== "
	echo
	
}

# Create channel
echo "Creating channel..."
createChannel

# Join all the peers to the channel
echo "Having all peers join the channel..."
joinChannel

# Set the anchor peers for each org in the channel
echo "Updating anchor peers for org1..."
updateAnchorPeers 0 1
echo "Updating anchor peers for org2..."
updateAnchorPeers 0 2
echo "Updating anchor peers for org3..."
updateAnchorPeers 0 3

# Install abac chaincode on Peer0/Org1 and Peer0/Org2
echo "Installing EHR chaincode on peer0.org1..."
installChaincode 0 1
echo "Install EHR chaincode on peer0.org2..."
installChaincode 0 2
echo "Install EHR chaincode on peer0.org3..."
installChaincode 0 3

# Install policy chaincode on Peer0/Org1 and Peer0/Org2
echo "Installing Policy chaincode on peer0.org1..."
installPolicyChaincode 0 1
echo "Install Policy chaincode on peer0.org2..."
installPolicyChaincode 0 2
echo "Install Policy chaincode on peer0.org3..."
installPolicyChaincode 0 3

# Instantiate policy chaincode from Peer0/Org1
echo "Instantiating Policy chaincode on peer0.org1..."
instantiatePolicyChaincode 0 1

# Instantiate chaincode from Peer0/Org1
echo "Instantiating EHR chaincode on peer0.org1..."
instantiateChaincode 0 1

echo "Waiting for instantiation request to be committed ..."
sleep 10

# Add new EHRs to the ledger
echo "Submitting initLedger transaction to abac chaincode"
echo "The transaction is sent to the three peers with the chaincode installed so that chaincode is built before receiving the following requests"
chaincodeInvoke 0 1 0 2 0 3

# Add new policies to the ledger
echo "Submitting initLedger transaction to policy chaincode"
echo "The transaction is sent to the three peers with the chaincode installed so that chaincode is built before receiving the following requests"
chaincodePolicyInvoke 0 1 0 2 0 3




echo
echo "========= AuBACE Network Setup Executed Correctly =========== "
echo
echo
echo " _____   _   _   ____   "
echo "| ____| | \ | | |  _ \  "
echo "|  _|   |  \| | | | | | "
echo "| |___  | |\  | | |_| | "
echo "|_____| |_| \_| |____/  "
echo
echo "Network setup completed. Now, to register users and start the web client, type: "
echo "./enroll.sh"
echo "node app.js"
echo

exit 0

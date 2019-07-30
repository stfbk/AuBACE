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
export WAIT=5 # set this variable to 45 in order to perform 2 transaction from 2 different peers inside the same block

: ${CHANNEL_NAME:="abac-channel"}
: ${TIMEOUT:="15"}
COUNTER=1
MAX_RETRY=5
ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/fbk.eu/orderers/orderer.fbk.eu/msp/tlscacerts/tlsca.fbk.eu-cert.pem

echo "Channel name : "$CHANNEL_NAME
echo "Delay : "$DELAY

# verify the result of the end-to-end test
verifyResult () {
	if [ $1 -ne 0 ] ; then
		echo "!!!!!!!!!!!!!!! "$2" !!!!!!!!!!!!!!!!"
    echo "========= ERROR !!! FAILED to execute ABAC Example ==========="
		echo
   		exit 1
	fi
}

# set environment variables needed to send the commands to the right peers
setGlobals () {

	if [ $1 -eq 0 -o $1 -eq 1 ] ; then
		CORE_PEER_LOCALMSPID="Org1MSP"
		CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
		CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
		if [ $1 -eq 0 ]; then
			CORE_PEER_ADDRESS=peer0.org1.example.com:7051
		else
			CORE_PEER_ADDRESS=peer1.org1.example.com:7051
			CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
		fi
	elif [ $1 -eq 2 -o $1 -eq 3 ] ; then 
		CORE_PEER_LOCALMSPID="Org2MSP"
		CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
		CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
		if [ $1 -eq 2 ]; then
			CORE_PEER_ADDRESS=peer0.org2.example.com:7051
		else
			CORE_PEER_ADDRESS=peer1.org2.example.com:7051
		fi
	else
		CORE_PEER_LOCALMSPID="Org3MSP"
		CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt
		CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp
		if [ $1 -eq 4 ]; then
			CORE_PEER_ADDRESS=peer0.org3.example.com:7051
		else
			CORE_PEER_ADDRESS=peer1.org3.example.com:7051
		fi
	fi

	env |grep CORE
}



# create the channel from peer0 of Org1
createChannel() {
	setGlobals 0

  if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
		peer channel create -o orderer.fbk.eu:7050 -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx >&log.txt
	else
		peer channel create -o orderer.fbk.eu:7050 -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA >&log.txt
	fi
	res=$?f4fe0807c4aa
	cat log.txt
	verifyResult $res "Channel creation failed"
	echo "===================== Channel \"$CHANNEL_NAME\" is created successfully ===================== "
	echo
}

updateAnchorPeers() {
  PEER=$1
  setGlobals $PEER

  if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
		peer channel update -o orderer.fbk.eu:7050 -c $CHANNEL_NAME -f ./channel-artifacts/${CORE_PEER_LOCALMSPID}anchors.tx >&log.txt
	else
		peer channel update -o orderer.fbk.eu:7050 -c $CHANNEL_NAME -f ./channel-artifacts/${CORE_PEER_LOCALMSPID}anchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA >&log.txt
	fi
	res=$?
	cat log.txt
	verifyResult $res "Anchor peer update failed"
	echo "===================== Anchor peers for org \"$CORE_PEER_LOCALMSPID\" on \"$CHANNEL_NAME\" is updated successfully ===================== "
	sleep $DELAY
	echo
}

# Sometimes Join takes time hence RETRY at least for 5 times
joinWithRetry () {
	peer channel join -b $CHANNEL_NAME.block  >&log.txt
	res=$?
	cat log.txt
	if [ $res -ne 0 -a $COUNTER -lt $MAX_RETRY ]; then
		COUNTER=` expr $COUNTER + 1`
		echo "PEER$1 failed to join the channel, Retry after 3 seconds"
		sleep $DELAY
		joinWithRetry $1
	else
		COUNTER=1
	fi
  verifyResult $res "After $MAX_RETRY attempts, PEER$ch has failed to Join the Channel"
}

# let all peer of the first two organizations joining the channel
joinChannel () {
	for ch in 0 1 2 3 4 5; do
		setGlobals $ch
		joinWithRetry $ch
		echo "===================== PEER$ch joined on the channel \"$CHANNEL_NAME\" ===================== "
		sleep $DELAY
		echo
	done
}

# install abac chaincode on the three anchor peers of each organization
installChaincode () {
	PEER=$1
	setGlobals $PEER
	peer chaincode install -n abac_chaincode -v 1.0 -p github.com/ehr/ >&log.txt
	res=$?
	cat log.txt
        verifyResult $res "Chaincode installation on remote peer PEER$PEER has Failed"
	echo "===================== EHR Chaincode is installed on remote peer PEER$PEER ===================== "
	echo
}

# instatiate abac chaincode on the channel from an anchor peer of one organization
instantiateChaincode () {
	PEER=$1
	setGlobals $PEER
	# while 'peer chaincode' command can get the orderer endpoint from the peer (if join was successful),
	# lets supply it directly as we know it using the "-o" option
	if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
		peer chaincode instantiate -o orderer.fbk.eu:7050 -C $CHANNEL_NAME -n abac_chaincode -v 1.0 -c '{"Args":[""]}' -P "OR ('Org1MSP.member', 'Org2MSP.member', 'Org3MSP.member')" >&log.txt
	else
		peer chaincode instantiate -o orderer.fbk.eu:7050 --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n abac_chaincode -v 1.0 -c '{"Args":[""]}' -P "OR ('Org1MSP.member', 'Org2MSP.member', 'Org3MSP.member')" >&log.txt
	fi
	res=$?
	cat log.txt
	verifyResult $res "Chaincode instantiation on PEER$PEER on channel '$CHANNEL_NAME' failed"
	echo "===================== EHR Chaincode Instantiation on PEER$PEER on channel '$CHANNEL_NAME' is successful ===================== "
	echo
}

# install policy chaincode on the three anchor peers of each organization
installPolicyChaincode () {
	PEER=$1
	setGlobals $PEER
	peer chaincode install -n policy_chaincode -v 1.0 -p github.com/policy/ >&log.txt
	res=$?
	cat log.txt
        verifyResult $res "Chaincode installation on remote peer PEER$PEER has Failed"
	echo "===================== Policy Chaincode is installed on remote peer PEER$PEER ===================== "
	echo
}

# instatiate abac chaincode on the channel from an anchor peer of one organization
instantiatePolicyChaincode () {
	PEER=$1
	setGlobals $PEER
	# while 'peer chaincode' command can get the orderer endpoint from the peer (if join was successful),
	# lets supply it directly as we know it using the "-o" option
	if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
		peer chaincode instantiate -o orderer.fbk.eu:7050 -C $CHANNEL_NAME -n policy_chaincode -v 1.0 -c '{"Args":[""]}' -P "OR ('Org1MSP.member', 'Org2MSP.member', 'Org3MSP.member')" >&log.txt
	else
		peer chaincode instantiate -o orderer.fbk.eu:7050 --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n policy_chaincode -v 1.0 -c '{"Args":[""]}' -P "OR ('Org1MSP.member', 'Org2MSP.member', 'Org3MSP.member')" >&log.txt
	fi
	res=$?
	cat log.txt
	verifyResult $res "Chaincode instantiation on PEER$PEER on channel '$CHANNEL_NAME' failed"
	echo "===================== Policy Chaincode Instantiation on PEER$PEER on channel '$CHANNEL_NAME' is successful ===================== "
	echo
}

chaincodeInvoke () {
	PEER1=$1
	setGlobals $PEER1

	echo "Calling abac chaincode to add data into the ledger"
	
	# while 'peer chaincode' command can get the orderer endpoint from the peer (if join was successful),
	# lets supply it directly as we know it using the "-o" option
	if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
		peer chaincode invoke -o orderer.fbk.eu:7050 -C $CHANNEL_NAME -n abac_chaincode -c '{"function":"initLedger","Args":[]}' >&log.txt
		
	else
		peer chaincode invoke -o orderer.fbk.eu:7050  --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n abac_chaincode -c '{"function":"initLedger","Args":[]}' >&log.txt
		
	fi
	res=$?
	cat log.txt
	verifyResult $res "Invoke execution on PEER$PEER failed "
	echo "===================== Invoke transaction on PEER$PEER on channel '$CHANNEL_NAME' is successful ===================== "
	echo
	
}

chaincodePolicyInvoke () {
	PEER1=$1
	setGlobals $PEER1

	echo "Calling policy chaincode to add data into the ledger"
	
	# while 'peer chaincode' command can get the orderer endpoint from the peer (if join was successful),
	# lets supply it directly as we know it using the "-o" option
	if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
		peer chaincode invoke -o orderer.fbk.eu:7050 -C $CHANNEL_NAME -n policy_chaincode -c '{"function":"initLedger","Args":[]}' >&log.txt

	else
		peer chaincode invoke -o orderer.fbk.eu:7050  --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n policy_chaincode -c '{"function":"initLedger","Args":[]}' >&log.txt

	fi
	res=$?
	cat log.txt
	verifyResult $res "Invoke execution on PEER$PEER failed "
	echo "===================== Invoke transaction on PEER$PEER on channel '$CHANNEL_NAME' is successful ===================== "
	echo
	
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
updateAnchorPeers 0
echo "Updating anchor peers for org2..."
updateAnchorPeers 2
echo "Updating anchor peers for org3..."
updateAnchorPeers 4

# Install abac chaincode on Peer0/Org1 and Peer0/Org2
echo "Installing EHR chaincode on peer0.org1..."
installChaincode 0
echo "Install EHR chaincode on peer0.org2..."
installChaincode 2
echo "Install EHR chaincode on peer0.org3..."
installChaincode 4
#installChaincode 1
#installChaincode 3
#installChaincode 5

# Install policy chaincode on Peer0/Org1 and Peer0/Org2
echo "Installing Policy chaincode on peer0.org1..."
installPolicyChaincode 0
echo "Install Policy chaincode on peer0.org2..."
installPolicyChaincode 2
echo "Install Policy chaincode on peer0.org3..."
installPolicyChaincode 4
#installPolicyChaincode 1
#installPolicyChaincode 3
#installPolicyChaincode 5

# Instantiate policy chaincode from Peer0/Org1
echo "Instantiating Policy chaincode on peer0.org1..."
instantiatePolicyChaincode 0

# Instantiate policy chaincode from Peer0/Org2
#echo "Instantiating Policy chaincode on peer0.org2..."
#instantiatePolicyChaincode 2
#echo "Instantiating Policy chaincode on peer0.org3..."
#instantiatePolicyChaincode 4

# Instantiate chaincode from Peer0/Org1
echo "Instantiating EHR chaincode on peer0.org1..."
instantiateChaincode 0

# Instantiate chaincode from Peer0/Org2
#echo "Instantiating EHR chaincode on peer0.org2..."
#instantiateChaincode 2
#echo "Instantiating EHR chaincode on peer0.org3..."
#instantiateChaincode 4



sleep $WAIT

# Add new EHRs to the ledger
echo "Add EHRs to the ledger ..."
chaincodeInvoke 0
#chaincodeInvoke 2
#chaincodeInvoke 4

# Add new policies to the ledger
echo "Add policies to the ledger ..."
chaincodePolicyInvoke 0
#chaincodePolicyInvoke 2
#chaincodePolicyInvoke 4

# Calling init method on peer0.org2 and peer0.org3 to run docker containers
echo "Calling init method on peer0.org2 and peer0.org3 (ehr and policy chaincodes)"
callInit 2
callInit 4


echo
echo "========= All GOOD, ABAC Network Setup Executed Correctly =========== "
echo
echo
echo " _____   _   _   ____   "
echo "| ____| | \ | | |  _ \  "
echo "|  _|   |  \| | | | | | "
echo "| |___  | |\  | | |_| | "
echo "|_____| |_| \_| |____/  "
echo
echo "Network setup completed - now type: "
echo "./register.sh"
echo "node server.js"
echo

exit 0

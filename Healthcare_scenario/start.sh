export FABRIC_CFG_PATH=${PWD}
export CHANNEL_NAME="abac-channel"
export DELAY=3
export TIMEOUT=5

echo
echo "STEP 1"
echo

# control that cryptogen tool is available and it is a recognized command
which cryptogen
    if [ "$?" -ne 0 ]; then
        echo "cryptogen tool not found. exiting"
        exit 1
    fi

# Delete the crypto-config folder if there is already one
echo
if [ -d "./crypto-config" ]; then
    echo 'Delete existing crypto-config folder'
    echo
    rm -r ./crypto-config/
fi

# Generate X.509 certificates
echo 'Generate certificates from crypto-config.yaml file'
    cryptogen generate --config=./crypto-config.yaml
    if [ "$?" -ne 0 ]; then
        echo "Failed to generate certificates..."
        exit 1
    fi
echo

echo
echo
echo 'STEP 2'
echo
# control that configtxgen tool is available and it is a recognized command
    which configtxgen
    if [ "$?" -ne 0 ]; then
        echo "configtxgen tool not found. exiting"
        exit 1
    fi
    echo

# Delete the channel-artifacts folder if there is already one
if [ -d "./channel-artifacts" ]; then
    echo 'Delete existing channel artifacts folder'
    echo
    rm -r ./channel-artifacts/
fi

# Create channel-artifcts folder
echo 'Create channel-artifacts folder'
    mkdir ./channel-artifacts
echo

# Generate genesis block
echo 'Generate genesis block'
    configtxgen -profile ABACGenesis -outputBlock ./channel-artifacts/genesis.block
    if [ "$?" -ne 0 ]; then
    echo "Failed to generate orderer genesis block..."
    exit 1
    fi
echo

# Generate channel configuration transactions
echo 'Generate channel configuration transaction'
    configtxgen -profile ABACChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID $CHANNEL_NAME
    if [ "$?" -ne 0 ]; then
        echo "Failed to generate channel configuration transaction..."
        exit 1
    fi
echo

# Generate anchor peer of Org1
echo 'Generate anchor peer for Org1'
    configtxgen -profile ABACChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org1MSP
    if [ "$?" -ne 0 ]; then
    echo "Failed to generate anchor peer update for Org1MSP..."
    exit 1
    fi
echo

# Generate anchor peer of Org2
echo 'Generate anchor peer for Org2'
    configtxgen -profile ABACChannel -outputAnchorPeersUpdate ./channel-artifacts/Org2MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org2MSP
    if [ "$?" -ne 0 ]; then
    echo "Failed to generate anchor peer update for Org2MSP..."
    exit 1
    fi
echo

# Generate anchor peer of Org3
echo 'Generate anchor peer for Org3'
    configtxgen -profile ABACChannel -outputAnchorPeersUpdate ./channel-artifacts/Org3MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org3MSP
    if [ "$?" -ne 0 ]; then
    echo "Failed to generate anchor peer update for Org3MSP..."
    exit 1
    fi
echo

echo
echo
echo "STEP 3"
echo
echo "Modify docker-compose-template file to add the correct keys"
./replace.sh



echo
echo
echo "STEP 4"
echo

# Remove running docker containers
    CONTAINER_IDS=$(docker ps -aq)
    if [ -z "$CONTAINER_IDS" ]; then
        echo 'No containers to delete'
    else
        echo 'Remove active docker containers'
        docker rm -f $CONTAINER_IDS
    fi
echo

# Start the new containers without prompting debug output
echo 'Start new containers'
    docker-compose -f docker-compose-cli.yaml up -d
echo

# Containers sanity check
echo 'peer0.org1.example.com'
    docker inspect peer0.org1.example.com | grep Running
    docker inspect peer0.org1.example.com | grep Error
echo
echo 'peer1.org1.example.com'
    docker inspect peer1.org1.example.com | grep Running
    docker inspect peer1.org1.example.com | grep Error
echo
echo 'peer0.org2.example.com'
    docker inspect peer0.org2.example.com | grep Running
    docker inspect peer0.org2.example.com | grep Error
echo
echo 'peer1.org2.example.com'
    docker inspect peer1.org2.example.com | grep Running
    docker inspect peer1.org2.example.com | grep Error
echo
echo 'peer0.org3.example.com'
    docker inspect peer0.org3.example.com | grep Running
    docker inspect peer0.org3.example.com | grep Error
echo
echo 'peer1.org3.example.com'
    docker inspect peer1.org3.example.com | grep Running
    docker inspect peer1.org3.example.com | grep Error
echo
echo 'orderer.fbk.eu'
    docker inspect orderer.fbk.eu | grep Running
    docker inspect orderer.fbk.eu | grep Error
echo

docker logs -f cli
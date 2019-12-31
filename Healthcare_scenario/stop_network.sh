# since this is a sample demo and all certificates are ad-hoc,
# this script stops the containers and also deletes all cryptographic material at the same time

docker rm -f $(docker ps -aq)
docker rmi $(docker images dev-* -q)
if [ -d "$HOME/.hfc-key-store" ]; then sudo rm -r $HOME/.hfc-key-store; fi

sudo rm -r ./ca-server-config/ca1/crypto-config
sudo rm -r ./ca-server-config/ca1/msp
sudo rm -r ./ca-server-config/ca1/fabric-ca-server-config.yaml
sudo rm -r ./ca-server-config/ca1/fabric-ca-server.db

# sudo rm -r ./ca-server-config/ca2/crypto-config
# sudo rm -r ./ca-server-config/ca2/msp
# sudo rm -r ./ca-server-config/ca2/fabric-ca-server-config.yaml
# sudo rm -r ./ca-server-config/ca2/fabric-ca-server.db

# sudo rm -r ./ca-server-config/ca3/crypto-config
# sudo rm -r ./ca-server-config/ca3/msp
# sudo rm -r ./ca-server-config/ca3/fabric-ca-server-config.yaml
# sudo rm -r ./ca-server-config/ca3/fabric-ca-server.db

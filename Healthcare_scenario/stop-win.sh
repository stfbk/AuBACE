docker rm -f $(docker ps -aq)
docker rmi $(docker images dev-* -q)

rm -r ./ca-server-config/ca1/crypto-config
rm -r ./ca-server-config/ca1/msp
rm -r ./ca-server-config/ca1/fabric-ca-server-config.yaml
rm -r ./ca-server-config/ca1/fabric-ca-server.db
if [ -d "$HOME/.hfc-key-store" ]; then rm -r $HOME/.hfc-key-store; fi
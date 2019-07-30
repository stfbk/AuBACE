key_file_org1_token="{{ key_file_org1 }}" # find all these...
key_file_org1=$(ls crypto-config/peerOrganizations/org1.example.com/ca/ | grep sk)
key_file_org2_token="{{ key_file_org2 }}" # find all these...
key_file_org2=$(ls crypto-config/peerOrganizations/org2.example.com/ca/ | grep sk)
key_file_org3_token="{{ key_file_org3 }}" # find all these...
key_file_org3=$(ls crypto-config/peerOrganizations/org3.example.com/ca/ | grep sk)


# output
echo ${key_file_org1_token} = ${key_file_org1}
echo ${key_file_org2_token} = ${key_file_org2}
echo ${key_file_org3_token} = ${key_file_org3}

# find and replace
sed -e "s/${key_file_org1_token}/${key_file_org1}/g" \
    -e "s/${key_file_org2_token}/${key_file_org2}/g" \
    -e "s/${key_file_org3_token}/${key_file_org3}/g" \
    < docker-compose-template.yaml \
    > docker-compose.yaml

# find and replace
sed -e "s/{{ keyfile }}/${key_file_org1}/g" \
    < ca-server-config/ca1/fabric-ca-server-config1-template.yaml \
    > ca-server-config/ca1/fabric-ca-server-config1.yaml

sed -e "s/{{ keyfile }}/${key_file_org2}/g" \
    < ca-server-config/ca2/fabric-ca-server-config2-template.yaml \
    > ca-server-config/ca2/fabric-ca-server-config2.yaml

sed -e "s/{{ keyfile }}/${key_file_org3}/g" \
    < ca-server-config/ca3/fabric-ca-server-config3-template.yaml \
    > ca-server-config/ca3/fabric-ca-server-config3.yaml
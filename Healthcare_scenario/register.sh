NUM_PATIENTS=100
NUM_DOCTORS=10

echo "Registering Org1 admin identitiy"
node registerAdmin1.js
echo "Registering Org1 predefined user identities"
node registerUser1.js

echo "Registering Org1 template patients"
for (( c=6; c<=$NUM_PATIENTS+5; c++ ))
do
   node register_Patient_x.js $c $((c-5)) &
done

echo "Registering Org1 template doctors"
for (( c=2; c<=$NUM_DOCTORS; c++ ))
do
   node register_Doctor_x.js $c &
done

#echo "Registering Org2 admin identitiy"
#node registerAdmin2.js
echo "Registering Org2 user identities"
node registerUser2.js

#echo "Registering Org3 admin1 identitiy"
#node registerAdmin3.js
echo "Registering Org3 user identities"
node registerUser3.js

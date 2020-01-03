NUM_PATIENTS=10
NUM_DOCTORS=10
NUM_ORGS=3

echo "Registering admin identity"
for (( org=1; org<=$NUM_ORGS; org++ ))
do
   node enrollAdmin.js $org &
done

echo "Registering initLedger predefined user identities"
node registerUser1.js

echo "Registering template patients"
for (( org=1; org<=$NUM_ORGS; org++ ))
do
for (( patient=6; patient<=$NUM_PATIENTS+5; patient++ ))
do
   node enrollPatient.js $org $patient $((patient-5)) &
done
done

echo "Registering template doctors"
for (( org=1; org<=$NUM_ORGS; org++ ))
do
for (( doctor=1; doctor<=$NUM_DOCTORS; doctor++ ))
do
   node enrollDoctor.js $org $doctor &
done
done

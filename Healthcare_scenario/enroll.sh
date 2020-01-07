NUM_PATIENTS=10
NUM_DOCTORS=10
NUM_NURSES=2
NUM_EMTS=1
NUM_ORGS=3

printf "\nEnrolling admin identity\n"
for (( org=1; org<=$NUM_ORGS; org++ ))
do
  node enrollAdmin.js $org &
  wait $!
done

# after enrolling the admin identities, 

printf "\nCreating org3.department1 affiliation\n"
# since the default CA image only has 2 depts for org1 and 1 dept for org2
# note also that the script forces the dept creation as org3 does not yet exist in the ca3 container's list of depts
node affiliation_force.js 3 department1

printf "\nEnrolling initLedger predefined user identities\n"
node enrollInitLedger.js &
wait $!

for (( org=1; org<=$NUM_ORGS; org++ ))
do

printf "\nEnrolling template patients\n"
for (( patient=6; patient<=$NUM_PATIENTS+5; patient++ ))
do
  node enrollPatient.js $org $patient $((patient-5)) &
  wait $!
done

printf "\nEnrolling template doctors\n"
for (( doctor=1; doctor<=$NUM_DOCTORS; doctor++ ))
do
  node enrollGP.js $org $doctor &
  wait $!
done

printf "\nEnrolling template nurses\n"
for (( nurse=1; nurse<=$NUM_NURSES; nurse++ ))
do
  node enrollNurse.js $org $nurse &
  wait $!
done

printf "\nEnrolling template EMTs\n"
for (( EMT=1; EMT<=$NUM_EMTS; EMT++ ))
do
  node enrollEMT.js $org $nurse &
  wait $!
done



done


printf "\nEnrollment complete. Now start web interface with\n"
printf "node server.js"


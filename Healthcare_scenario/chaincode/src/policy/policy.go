package main

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/hyperledger/fabric/protos/peer"
)

var policyLogger = shim.NewLogger("policy-sample")

// Policy defins the Smart Contract we are running
type Policy struct {
}

type policies struct {
	Allow     bool
	Consent   []bool
	Principal []string
	Action    []string
	Purpose   []string
}

// Init function, which is empty for us
func (s *Policy) Init(stub shim.ChaincodeStubInterface) peer.Response {
	return shim.Success(nil)
}

// Invoke function needed to decide what is the request
func (s *Policy) Invoke(stub shim.ChaincodeStubInterface) peer.Response {

	policyLogger.SetLevel(shim.LogDebug)
	// Retrieve request paramenters
	function, args := stub.GetFunctionAndParameters()

	policyLogger.Debug("Chaincode Invoke method")

	switch function {
	case "init":
		return s.Init(stub)
	case "initLedger":
		//return shim.Success(nil)
		return s.initLedger(stub, args)
	case "applyPolicy":
		return s.applyPolicy(stub, args)
		/*case "viewPolicy":
			return s.viewPolicy(stub, args)
		case "updatePolicy":
			return s.updatePolicy(stub, args)
		case "addPolicy":
			return s.addPolicy(stub, args)
		case "deletePolicy":
			return s.deletePolicy(stub, args)*/
	}

	return shim.Error("Invalid request")
}

/*
	The initLedger method is used to insert some predefined policies during network creation
*/
func (s *Policy) initLedger(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	policyLogger.SetLevel(shim.LogDebug)

	if len(args) != 0 {
		return shim.Error("Error: invalid number of arguments for initLedger - expected 0")
	}

	// aggiungere un campo e una funzione che permette ad un paziente di cambiare il consenso
	// l'azione di update è riferita al ehr che si trova nel cloud
	// should data1 (the ec data controller admin) be of the type health board?
	policy := []policies{
		policies{Allow: true, Consent: []bool{true, false}, Principal: []string{"Patient"}, Action: []string{"Read", "UpdateConsent"}, Purpose: []string{"whatever"}},
		//policies{Allow: true, Consent: []bool{true, false}, Principal: []string{"Data_Controller_Admin"}, Action: []string{"Read", "Write", "Update"}},
		policies{Allow: true, Consent: []bool{true, false}, Principal: []string{"Emergency_Medical_Technicians"}, Action: []string{"Read", "Update"}, Purpose: []string{"emergency_services"}},
		policies{Allow: true, Consent: []bool{true}, Principal: []string{"General_Practitioner"}, Action: []string{"Read", "Write", "Update"}, Purpose: []string{"preventive_medicine", "medical_diagnosis", "provision_of_care"}},
		policies{Allow: true, Consent: []bool{true, false}, Principal: []string{"Health_Board"}, Action: []string{"Read"}, Purpose: []string{"auditing"}},
		policies{Allow: true, Consent: []bool{true}, Principal: []string{"Nursing_Staff"}, Action: []string{"Read", "Update"}, Purpose: []string{"provision_of_care"}},
	}

	i := 0
	for i < len(policy) {
		policyAsBytes, _ := json.Marshal(policy[i])
		key := "policy" + strconv.Itoa(i)
		fmt.Println("Added: ", key, policy[i])
		stub.PutState(key, policyAsBytes)
		i = i + 1

		policyAfter := policies{}
		json.Unmarshal(policyAsBytes, &policyAfter)
		fmt.Println("Policy retrieved immediately: ", policyAfter)

	}

	return shim.Success(nil)
}

/*
	The applyPolicy method is used to evaluate a request against all policies
*/
func (s *Policy) applyPolicy(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	policyLogger.SetLevel(shim.LogDebug)
	policyLogger.Debug("Entering applyPolicy")

	// get the attribute role to check if the request is compliant with the policy
	/*role, ok, err := cid.GetAttributeValue(stub, "role")
	if err != nil {
		return shim.Error("There was an error while reading role attribute")
	}
	if !ok {
		return shim.Error("The client does not have the attribute role")
	}
	policyLogger.Debug("The attribute role has a value of " + role)*/

	// check if the number of parameter that has been passed to the chaincode is correct, throw an error if not
	if len(args) != 4 {
		return shim.Error("Error: invalid number of arguments for addPolicy - expected 4")
	}

	// create the electronic health record
	//var ehr = EHR{LastAccess: "", From: "", Result: "", Consent: false} //controllare numero parametri

	// applyPolicies gets as arguments the stub, the action, the role attribute and the consent value of the ehr
	policyLogger.Debug("Checking the policies")
	allowed := applyPolicies(stub, args[0], args[1], args[2], args[3])

	// throw a specific error if the client is not allowed to perform the requested operation on the selected ehr
	policyLogger.Debug("At the end, allowed: " + strconv.FormatBool(allowed))
	if !allowed {
		return shim.Error("The client does not have the rights to write the selected electronic health record")
	}

	//if this is executed, everythig has gone well
	/*ehrAsBytes, _ := json.Marshal(ehr)
	err = stub.PutState(args[0], ehrAsBytes)
	if err != nil {
		return shim.Error("Failed to insert a new ehr " + args[0])
	}*/

	return shim.Success(nil)
}

// main function starts up the chaincode in the container during instantiate
func main() {
	if err := shim.Start(new(Policy)); err != nil {
		fmt.Printf("Error starting Policy chaincode: %s", err)
	}
}

func contains(name string, array []string) bool {
	i := 0
	policyLogger.Debug("Array length: " + strconv.Itoa(len(array)))
	for i < len(array) {
		policyLogger.Debug("Name: " + name + " - element: " + array[i])
		if array[i] == name {
			policyLogger.Debug("Return true")
			return true
		}
		i = i + 1
	}
	policyLogger.Debug("Return false")
	return false
}

func boolConsentContained(name bool, array []bool) bool {
	i := 0
	policyLogger.Debug("Array length: " + strconv.Itoa(len(array)))
	for i < len(array) {
		policyLogger.Debug("Name: " + strconv.FormatBool(name) + " - element: " + strconv.FormatBool(array[i]))
		if array[i] == name {
			policyLogger.Debug("Return true")
			return true
		}
		i = i + 1
	}
	policyLogger.Debug("Return false")
	return false
}

/*func trackHistory(toModify EHR, date string, result string, identity string) EHR {

	toModify.LastAccess = date
	toModify.From = identity
	toModify.Result = result

	return toModify
}*/

func applyPolicies(stub shim.ChaincodeStubInterface, action string, role string, consent string, purpose string) bool {

	var results []bool

	policyLogger.Debug("Retrieving all policies")

	// create the iterator to retrieve all policies
	resultsIterator, err := stub.GetStateByRange("policy0", "policy9")
	if err != nil {
		policyLogger.Debug("Get Policy By Range - there has been an error")
		policyLogger.Debug(err)
		return false

	}
	defer resultsIterator.Close()

	policyLogger.Debug("Iterating through policies")
	// perform abac on all policies
	for resultsIterator.HasNext() {

		queryResponse, err := resultsIterator.Next()
		if err != nil {
			policyLogger.Debug(err)
			return false
		}

		policy := policies{}
		json.Unmarshal(queryResponse.Value, &policy)

		c, err := strconv.ParseBool(consent)
		if contains(role, policy.Principal) {
			if action == "Write" {
				if contains(action, policy.Action) && contains(purpose, policy.Purpose) {
					results = append(results, policy.Allow)
				}
			} else if boolConsentContained(c, policy.Consent) && contains(action, policy.Action) && contains(purpose, policy.Purpose) {
				results = append(results, policy.Allow)
			}
		}
	}

	policyLogger.Debug("Results array contains --------------------------------------- " + strconv.Itoa(len(results)))
	for j := 0; j < len(results); j++ {
		policyLogger.Debug(strconv.FormatBool(results[j]))
	}

	if len(results) == 0 || boolConsentContained(false, results) {
		return false
	}

	return true
}

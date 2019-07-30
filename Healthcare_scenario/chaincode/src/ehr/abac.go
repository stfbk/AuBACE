package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/common/util"
	"github.com/hyperledger/fabric/core/chaincode/lib/cid"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/hyperledger/fabric/protos/peer"
)

var logger = shim.NewLogger("abac-sample")

// SmartContract defins the Smart Contract we are running
type SmartContract struct {
}

// EHR defines the resource attributes
type EHR struct {
	LastRequest string `json:"lastrequest"`
	From        string `json:"from"`
	Decision    string `json:"decision"`
	Consent     bool   `json:"consent"`
}

type policies struct {
	Allow    bool
	Consent  []bool
	User     []string
	Action   []string
	Resource []string
	Purpose  []string
}

// Init function, which is empty for us
func (s *SmartContract) Init(stub shim.ChaincodeStubInterface) peer.Response {
	logger.SetLevel(shim.LogDebug)
	return shim.Success(nil)
}

// Invoke function needed to decide what is the request
func (s *SmartContract) Invoke(stub shim.ChaincodeStubInterface) peer.Response {

	// Retrieve request paramenters
	function, args := stub.GetFunctionAndParameters()

	logger.Debug("Chaincode Invoke method")

	switch function {
	case "init":
		return s.Init(stub)
	case "initLedger":
		return s.initLedger(stub, args)
	case "viewMedicalRecord":
		return s.viewMedicalRecord(stub, args)
	case "viewMedicalRecordNoEval":
		return s.viewMedicalRecordNoEval(stub, args)
	case "updateMedicalRecord":
		return s.updateMedicalRecord(stub, args)
	case "updateMedicalRecordNoEval":
		return s.updateMedicalRecordNoEval(stub, args)
	case "getGlobalState":
		return s.getGlobalState(stub, args)
	case "getGlobalStateNoEval":
		return s.getGlobalStateNoEval(stub, args)
	case "addMedicalRecord":
		return s.addMedicalRecord(stub, args)
	case "addMedicalRecordNoEval":
		return s.addMedicalRecordNoEval(stub, args)
	case "updateConsent":
		return s.updateConsent(stub, args)
	case "updateConsentNoEval":
		return s.updateConsentNoEval(stub, args)
	case "trackMedicalRecord":
		return s.trackMedicalRecord(stub, args)
	case "trackMedicalRecordNoEval":
		return s.trackMedicalRecordNoEval(stub, args)
	}

	return shim.Error("Invalid request")
}

// The initLedger method is used to insert some predefined medical_record during network creation
func (s *SmartContract) initLedger(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	if len(args) != 0 {
		return shim.Error("Error: invalid number of arguments for initLedger - expected 0")
	}

	ehr := []EHR{
		EHR{LastRequest: "", From: "", Decision: "", Consent: false},
		EHR{LastRequest: "", From: "", Decision: "", Consent: false},
		EHR{LastRequest: "", From: "", Decision: "", Consent: false},
		EHR{LastRequest: "", From: "", Decision: "", Consent: false},
		EHR{LastRequest: "", From: "", Decision: "", Consent: false},
	}

	ledgerkeys := [10]string{"RSSSTF63M05C112S", "BNCCRL85M12C143Y", "VRDNNA97F01S432I", "SMNGVN96M03A111S", "RSSALS45F11R021T"}

	i := 0
	for i < len(ehr) {
		ehrAsBytes, _ := json.Marshal(ehr[i])
		stub.PutState(ledgerkeys[i], ehrAsBytes)
		fmt.Println("Added", ehr[i])
		i = i + 1
	}

	return shim.Success(nil)
}

func arg_eval(stub shim.ChaincodeStubInterface, args []string, arg_num int, func_name string) (string, string){

	if len(args) != arg_num {
		return "Error: invalid number of arguments for "+ func_name +" - expected "+ strconv.Itoa(arg_num), ""
	}
	
	role, ok, err := cid.GetAttributeValue(stub, "role")
	
	if err != nil {
		return "There was an error while reading the role attribute", ""
	}
	
	if !ok {
		return "The client does not have the attribute role", ""
	}
	
	logger.Debug("The attribute role has a value of " + role)
	
	return "ok", role
}

func pol_eval(stub shim.ChaincodeStubInterface, action string, role string, consent string, purpose string) string{
	
	chainCodeArgs := util.ToChaincodeArgs("applyPolicy", action, role, consent, purpose)
	policyCCResponse := stub.InvokeChaincode("policy_chaincode", chainCodeArgs, "abac-channel")

	if policyCCResponse.Status != shim.OK {
		logger.Error(" --- Policy Evaluation returns an Error --- ")
		return "The client does not have the rights to write the selected electronic health record"
	}
	
	logger.Debug("---------      OK, CHAINCODE INVOKED CORRECTLY        ----------")
	
	return "ok"
}
	
// The addMedicalRecord method is used to insert a medical_record to the ledger
func (s *SmartContract) addMedicalRecord(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	logger.Debug("Entering addMedicalRecord")

	res, role := arg_eval (stub, args, 2, "addMedicalRecord") //[0] Fiscal_code, [1] Purpose
	
	if res != "ok"{
		return shim.Error(res)
	}

	if present, _ := stub.GetState(args[0]); present != nil {
		return shim.Error("The specified ehr already exist. You can only request its update")
	}

	if res = pol_eval (stub, "Write", role, "false", args[1]); res != "ok" {
		return shim.Error(res)
	}
	
	var ehr = EHR{LastRequest: "", From: "", Decision: "", Consent: false}
	ehrAsBytes, _ := json.Marshal(ehr)
	
	err := stub.PutState(args[0], ehrAsBytes)
	
	if err != nil {
		return shim.Error("Failed to insert a new ehr " + args[0])
	}

	return shim.Success(nil)
}

func (s *SmartContract) addMedicalRecordNoEval(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	logger.Debug("Entering addMedicalRecordNoEval")

	res, role := arg_eval (stub, args, 1, "addMedicalRecordNoEval") //[0] Fiscal_code
	
	if res != "ok"{
		return shim.Error(res)
	}
	
	logger.Debug("The attribute role has a value of " + role)

	if present, _ := stub.GetState(args[0]); present != nil {
		return shim.Error("The specified ehr already exist. You can only request its update")
	}

	var ehr = EHR{LastRequest: "", From: "", Decision: "", Consent: false}
	ehrAsBytes, _ := json.Marshal(ehr)
	
	err := stub.PutState(args[0], ehrAsBytes)
	
	if err != nil {
		return shim.Error("Failed to insert a new ehr " + args[0])
	}

	return shim.Success(nil)
}

/*
	The viewMedicalRecord method is used to retrieve and display an EHR
*/
func (s *SmartContract) viewMedicalRecord(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	logger.Debug("Entering viewMedicalRecord")

	res, role := arg_eval (stub, args, 2, "viewMedicalRecord") //[0] Fiscal_code, [1] Purpose
	
	if res != "ok"{
		return shim.Error(res)
	}
	
	if role == "Patient" {
		cf, okCF, errCF := cid.GetAttributeValue(stub, "cf")
		if errCF != nil {
			return shim.Error("There was an error while reading cf attribute")
		}
		if !okCF {
			return shim.Error("The client does not have the attribute cf")
		}
		logger.Debug("The attribute cf has a value of " + cf)

		if cf != args[0] {
			logger.Error("---------        ERROR: cf != args[0] in viewMedicalRecord   --------------")
			return shim.Error("The client does not have the rights to retrieve ehr related information")
		}
	}

	// retrieve the requested electronic health record
	ehrAsBytes, _ := stub.GetState(args[0])
	if ehrAsBytes == nil {
		return shim.Error("The requested electronic health record does not exist")
	}

	// create the object to pass as a response to the client
	ehr := EHR{}
	json.Unmarshal(ehrAsBytes, &ehr)
	
	if res = pol_eval (stub, "Read", role, strconv.FormatBool(ehr.Consent), args[1]); res != "ok" {
		return shim.Error(res)
	}

	//if everything is ok, pass the requested ehr as response to the client
	return shim.Success(ehrAsBytes)
}

func (s *SmartContract) viewMedicalRecordNoEval(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	logger.Debug("Entering viewMedicalRecordNoEval")

	res, role := arg_eval (stub, args, 1, "viewMedicalRecordNoEval") //[0] Fiscal_code
	
	if res != "ok"{
		return shim.Error(res)
	}
	
	if role == "Patient" {
		cf, okCF, errCF := cid.GetAttributeValue(stub, "cf")
		if errCF != nil {
			return shim.Error("There was an error while reading cf attribute")
		}
		if !okCF {
			return shim.Error("The client does not have the attribute cf")
		}
		logger.Debug("The attribute cf has a value of " + cf)

		if cf != args[0] {
			logger.Error("---------        ERROR: cf != args[0] in viewMedicalRecordNoEval   --------------")
			return shim.Error("The client does not have the rights to retrieve ehr related information")
		}
	}

	// retrieve the requested electronic health record
	ehrAsBytes, _ := stub.GetState(args[0])
	if ehrAsBytes == nil {
		return shim.Error("The requested electronic health record does not exist")
	}

	// create the object to pass as a response to the client
	ehr := EHR{}
	json.Unmarshal(ehrAsBytes, &ehr)

	//if everything is ok, pass the requested ehr as response to the client
	return shim.Success(ehrAsBytes)
}
/*
	The updateMedicalRecord method is used to update the ledger as a consequence of a read/write function
*/
func (s *SmartContract) updateMedicalRecord(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	logger.Debug("Inside updateMedicalRecord function")

	res, role := arg_eval (stub, args, 2, "updateMedicalRecord") //[0] Fiscal_code, [1] Purpose
	
	if res != "ok"{
		return shim.Error(res)
	}

	// retrieve the requested electronic health record
	ehrAsBytes, _ := stub.GetState(args[0])
	if ehrAsBytes == nil {
		return shim.Error("The requested electronic health record does not exist, you cannot update it")
	}

	// create the object that represent the ehr to update
	ehr := EHR{}
	json.Unmarshal(ehrAsBytes, &ehr)

	if res = pol_eval (stub, "Update", role, strconv.FormatBool(ehr.Consent), args[1]); res != "ok" {
		return shim.Error(res)
	}

	return shim.Success(ehrAsBytes)
}

func (s *SmartContract) updateMedicalRecordNoEval(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	logger.Debug("Inside updateMedicalRecordNoEval function")

	res, _ := arg_eval (stub, args, 1, "updateMedicalRecordNoEval") //[0] Fiscal_code
	
	if res != "ok"{
		return shim.Error(res)
	}

	// retrieve the requested electronic health record
	ehrAsBytes, _ := stub.GetState(args[0])
	if ehrAsBytes == nil {
		return shim.Error("The requested electronic health record does not exist, you cannot update it")
	}

	return shim.Success(ehrAsBytes)
}

/*
	The updateConsent method is used to update the ledger as a consequence of a read/write function
*/
func (s *SmartContract) updateConsent(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	logger.Debug("Inside updateConsent function")

	res, role := arg_eval (stub, args, 3, "addMedicalRecord") //[0] Fiscal_code, [1] Consent, [2] Purpose

	if res != "ok"{
		return shim.Error(res)
	}

	cf, okCF, errCF := cid.GetAttributeValue(stub, "cf")
	if errCF != nil {
		return shim.Error("There was an error while reading cf attribute")
	}
	if !okCF {
		return shim.Error("The client does not have the attribute cf")
	}
	
	logger.Debug("The attribute cf has a value of " + cf)

	if cf != args[0] {
		logger.Error("---------        ERROR: cf != args[0] in updateConsent   --------------")
		return shim.Error("The client does not have the rights to update the consent in the selected electronic health record")
	}

	// retrieve the requested electronic health record
	ehrAsBytes, _ := stub.GetState(args[0])
	if ehrAsBytes == nil {
		return shim.Error("The requested electronic health record does not exist, you cannot update its consent")
	}

	// create the object that represent the ehr to update
	ehr := EHR{}
	json.Unmarshal(ehrAsBytes, &ehr)

	consent, err := strconv.ParseBool(args[1])
	if err != nil {
		return shim.Error("consent is not a boolean")
	}

	if res = pol_eval (stub, "UpdateConsent", role, strconv.FormatBool(ehr.Consent), args[2]); res != "ok" {
		return shim.Error(res)
	}

	// if everything is ok, update the ehr and return a success
	ehr.Consent = consent

	ehrAsBytes, _ = json.Marshal(ehr)
	err = stub.PutState(args[0], ehrAsBytes)
	if err != nil {
		return shim.Error("Could not update the selected electronic health record")
	}

	return shim.Success(nil)
}

func (s *SmartContract) updateConsentNoEval(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	logger.Debug("Inside updateConsent function")

	res, _ := arg_eval (stub, args, 2, "addMedicalRecord") //[0] Fiscal_code, [1] Consent

	if res != "ok"{
		return shim.Error(res)
	}
	
	cf, okCF, errCF := cid.GetAttributeValue(stub, "cf")
	if errCF != nil {
		return shim.Error("There was an error while reading cf attribute")
	}
	if !okCF {
		return shim.Error("The client does not have the attribute cf")
	}
	
	logger.Debug("The attribute cf has a value of " + cf)

	//if cf != args[0] {
	//	logger.Error("---------        ERROR: cf != args[0] in updateConsent   --------------")
	//	return shim.Error("The client does not have the rights to update the consent in the selected electronic health record")
	//}

	// retrieve the requested electronic health record
	ehrAsBytes, _ := stub.GetState(args[0])
	if ehrAsBytes == nil {
		return shim.Error("The requested electronic health record does not exist, you cannot update its consent")
	}

	// create the object that represent the ehr to update
	ehr := EHR{}
	json.Unmarshal(ehrAsBytes, &ehr)

	consent, err := strconv.ParseBool(args[1])
	if err != nil {
		return shim.Error("consent is not a boolean")
	}

	// if everything is ok, update the ehr and return a success
	ehr.Consent = consent

	ehrAsBytes, _ = json.Marshal(ehr)
	err = stub.PutState(args[0], ehrAsBytes)
	if err != nil {
		return shim.Error("Could not update the selected electronic health record")
	}

	return shim.Success(nil)
}
/*
	The trackMedicalRecord method is used to update the ledger as a consequence of a read/write function
*/
func (s *SmartContract) trackMedicalRecord(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	logger.Debug("Inside trackMedicalRecord function")

	if len(args) != 5 {
		return shim.Error("Error: invalid number of arguments for trackMedicalRecord - expected 5")
	}

	// get the attribute role to check if the request is compliant with the policy
	role, ok, err := cid.GetAttributeValue(stub, "role")
	if err != nil {
		return shim.Error("There was an error while reading role attribute")
	}
	if !ok {
		return shim.Error("The client does not have the attribute role")
	}
	logger.Debug("The attribute role has a value of " + role)

	// retrieve the requested electronic health record
	ehrAsBytes, _ := stub.GetState(args[0])
	if ehrAsBytes == nil {
		return shim.Error("The requested electronic health record does not exist, you cannot update it")
	}

	// create the object that represent the ehr to update
	ehr := EHR{}
	json.Unmarshal(ehrAsBytes, &ehr)

	chainCodeArgs := util.ToChaincodeArgs("applyPolicy", args[2], role, strconv.FormatBool(ehr.Consent), args[4])
	policyCCResponse := stub.InvokeChaincode("policy_chaincode", chainCodeArgs, "abac-channel")

	ehr.LastRequest = args[3]
	ehr.From = args[1]

	if policyCCResponse.Status != shim.OK {
		logger.Error("---------        ACTION NOT ALLOWED     --------------")
		ehr.Decision = "Disallowed"
		ehrAsBytes, _ = json.Marshal(ehr)
		err = stub.PutState(args[0], ehrAsBytes)
		if err != nil {
			return shim.Error("Could not update the selected electronic health record")
		}
		return shim.Success(nil)
	}
	logger.Debug("---------      OK, ACTION ALLOWED        ----------")

	ehr.Decision = "Allowed"
	ehrAsBytes, _ = json.Marshal(ehr)
	err = stub.PutState(args[0], ehrAsBytes)
	if err != nil {
		return shim.Error("Could not update the selected electronic health record")
	}

	return shim.Success(nil)
}


func (s *SmartContract) trackMedicalRecordNoEval(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	logger.SetLevel(shim.LogDebug)
	logger.Debug("NoEval: Inside trackMedicalRecord function")

	if len(args) != 4{
		return shim.Error("NoEval: Error: invalid number of arguments for trackMedicalRecord - expected 4")
	}

	// retrieve the requested electronic health record
	ehrAsBytes, _ := stub.GetState(args[0])
	if ehrAsBytes == nil {
		return shim.Error("NoEval: The requested electronic health record does not exist, you cannot update it")
	}

	// create the object that represent the ehr to update
	ehr := EHR{}
	json.Unmarshal(ehrAsBytes, &ehr)

	ehr.LastRequest = args[3]
	ehr.From = args[1]

	ehr.Decision = "Allowed"
	ehrAsBytes, _ = json.Marshal(ehr)
	err := stub.PutState(args[0], ehrAsBytes)
	if err != nil {
		return shim.Error("NoEval: Could not update the selected electronic health record")
	}

	return shim.Success(nil)
}

/*
	The getGlobalState method is used to query the state of all assets saved
*/
func (s *SmartContract) getGlobalState(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	logger.Debug("Entering getGlobalState")

	res, role := arg_eval (stub, args, 1, "getGlobalState") // [0] Purpose

	if res != "ok"{
		return shim.Error(res)
	}
	
	if role == "Patient" {
		var rBuffer bytes.Buffer
		rBuffer.WriteString("[]")
		return shim.Success(rBuffer.Bytes())
	}

	startKey := "0000000000000000"
	endKey := "ZZZZZZZZZZZZZZZZ"

	resultsIterator, err := stub.GetStateByRange(startKey, endKey)
	if err != nil {
		logger.Debug("Get State By Range - there has been an error")
		logger.Debug(err)
		return shim.Error(err.Error())

	}
	defer resultsIterator.Close()

	logger.Debug("Getting global state from the ledger")

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	thisTime := false

	for resultsIterator.HasNext() {

		logger.Debug("Found a record in ehr")

		// define the parameter needed to check the authorization
		//allowed := false

		queryResponse, err := resultsIterator.Next()
		if err != nil {
			logger.Debug("iterating through results")
			logger.Debug(err)
			return shim.Error(err.Error())
		}
		// Add comma before array members,suppress it for the first array member
		if bArrayMemberAlreadyWritten == true && thisTime == true {
			buffer.WriteString(",")
		}

		thisTime = false

		ehr := EHR{}
		json.Unmarshal(queryResponse.Value, &ehr)

		if res = pol_eval (stub, "Read", role, strconv.FormatBool(ehr.Consent), args[0]); res == "ok" {
			logger.Debug("OK, insert the current ehr in the list")
			if len(queryResponse.Key) == 16 {
				buffer.WriteString("{\"Key\":")
				buffer.WriteString("\"")
				buffer.WriteString(queryResponse.Key)
				buffer.WriteString("\"")

				buffer.WriteString(", \"Record\":")
				// Record is a JSON object, so we write as-is
				buffer.WriteString(string(queryResponse.Value))
				buffer.WriteString("}")
				bArrayMemberAlreadyWritten = true
				thisTime = true
			}
		}

	}

	buffer.WriteString("]")

	fmt.Printf("- getGlobalState:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

func (s *SmartContract) getGlobalStateNoEval(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	logger.Debug("Entering getGlobalStateNoEval")

	res, role := arg_eval (stub, args, 0, "getGlobalStateNoEval")

	if res != "ok"{
		return shim.Error(res)
	}
	
	if role == "Patient" {
		var rBuffer bytes.Buffer
		rBuffer.WriteString("[]")
		return shim.Success(rBuffer.Bytes())
	}
	
	startKey := "0000000000000000"
	endKey := "ZZZZZZZZZZZZZZZZ"

	resultsIterator, err := stub.GetStateByRange(startKey, endKey)
	if err != nil {
		logger.Debug("NoEval: Get State By Range - there has been an error")
		logger.Debug(err)
		return shim.Error(err.Error())

	}
	defer resultsIterator.Close()

	logger.Debug("NoEval: Getting global state from the ledger")

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	thisTime := false

	for resultsIterator.HasNext() {

		logger.Debug("NoEval: Found a record in ehr")

		// define the parameter needed to check the authorization
		//allowed := false

		queryResponse, err := resultsIterator.Next()
		if err != nil {
			logger.Debug("NoEval: iterating through results")
			logger.Debug(err)
			return shim.Error(err.Error())
		}
		// Add comma before array members,suppress it for the first array member
		if bArrayMemberAlreadyWritten == true && thisTime == true {
			buffer.WriteString(",")
		}

		thisTime = false

		ehr := EHR{}
		json.Unmarshal(queryResponse.Value, &ehr)

		logger.Debug("NoEval: OK, insert the current ehr in the list")
		if len(queryResponse.Key) == 16 {
				buffer.WriteString("{\"Key\":")
				buffer.WriteString("\"")
				buffer.WriteString(queryResponse.Key)
				buffer.WriteString("\"")

				buffer.WriteString(", \"Record\":")
				// Record is a JSON object, so we write as-is
				buffer.WriteString(string(queryResponse.Value))
				buffer.WriteString("}")
				bArrayMemberAlreadyWritten = true
				thisTime = true
			}
		

	}

	buffer.WriteString("]")

	fmt.Printf("NoEval: - getGlobalState:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

// main function starts up the chaincode in the container during instantiate
func main() {
	if err := shim.Start(new(SmartContract)); err != nil {
		fmt.Printf("Error starting SmartContract chaincode: %s", err)
	}
}

func contains(name string, array []string) bool {
	i := 0
	logger.Debug("Lunghezza dell'array: " + strconv.Itoa(len(array)))
	for i < len(array) {
		logger.Debug("Name: " + name + " - elemento: " + array[i])
		if array[i] == name {
			logger.Debug("Return true")
			return true
		}
		i = i + 1
	}
	logger.Debug("Return false")
	return false
}

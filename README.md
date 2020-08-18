# The Audit-Based Access Control Enforcement (AuBACE) framework

Controlled information sharing in organizations is essential to prevent unauthorized disclosure and malicious or accidental unauthorized changes to data, while ensuring accessibility by authorized users whenever needed: i.e., grant availability of data while ensuring its confidentiality and integrity.

Given the diffusion and impact of insider attacks, and the constraints and guarantees introduced by privacy regulations (e.g. GDPR), we propose a framework that employs the Hyperledger Fabric Distributed Ledger Technology (DLT) to guarantee the strong integrity of the audit log, a single point of policy administration, and the efficient and distributed enforcement of policies with less trust in administrators.

Additional information can be found at [sites.google.com/fbk.eu/aubace](https://sites.google.com/fbk.eu/aubace).

## Usage

To run our Healthcare use case: start the network; enroll users, if it hasn't been done already; run the web app and open the browser to interact with the ledger.

```bash
./start_network.sh
./enroll.sh
node app.js
```

Please check the output of each script. If receiving an error associated with the Docker *orderer* container when starting the network, stop the network (with the command below), ensure that the *channel-artifacts* folder exists (and is empty) and manually remove the *crypto-config* folder; then attempt the running again.

To stop the network:

```bash
./stop_network.sh
```

The test dashboard is available at `localhost:8000`. Allowed operations in the web app are:

### Auditing / Emergency

  < Data1, *Auditing*, *Query All Electronic Health Record Saved* >

  < Emergency1, *Emergency services*,  *Query All Electronic Health Record Saved* / *Query a Specific Electronic Health Record (Tax code of any patient)*  >

### Doctors / Nurses

  < Doctor1/2, *Preventive medicine* / *Medical Diagnosis* / *Provision of care*, *Query a Specific Electronic Health Record* / *Ask for permission to update Electronic Health Record*  (Tax Code of a patient with consent set to true beforehand) >

  < Doctor1/2, *Preventive medicine* / *Medical Diagnosis* / *Provision of care*, *Create Electronic Health Record*  (non pre-existing Tax Code) >

  < Nurse1/2, *Provision of care*, *Query a Specific Electronic Health Record* (Tax Code of a patient with consent set to true beforehand)  >

### Patients

  < Patient1, *Whatever*, *Query a Specific Electronic Health Record* (RSSSTF63M05C112S) /  *Update Consent on Electronic Health Record* (true/false)>

  < Patient2, *Whatever*, *Query a Specific Electronic Health Record (BNCCRL85M12C143Y)* /  *Update Consent on Electronic Health Record* (true/false) >

  < Patient3, *Whatever*, *Query a Specific Electronic Health Record (VRDNNA97F01S432I)* /  *Update Consent on Electronic Health Record* (true/false) >

  < Patient4, *Whatever*, *Query a Specific Electronic Health Record (SMNGVN96M03A111S)* /  *Update Consent on Electronic Health Record* (true/false) >

  < Patient5, *Whatever*, *Query a Specific Electronic Health Record (RSSALS45F11R021T)* /  *Update Consent on Electronic Health Record* (true/false) >

For testing purposes, the enrolling script also registers the identities of patient6 (FISCALCODE1) to patient15 (FISCALCODE10); their operations can be performed via `http://127.0.0.1:8000/get_ehr/FISCALCODEX-patientY-whatever` and `http://localhost:8000/update_consent/FISCALCODEX-true-patientY-whatever` once their EHR has been created by a doctor (e.g., via < Doctor1, *Provision of care*, *Create Electronic Health Record*  (FISCALCODE1) >).

## Requirements

The core requirements are derived from Hyperledger Fabric, with smart contracts written in go and client software in nodejs.

* [Hyperledger Fabric v.1.4.8](https://hyperledger-fabric.readthedocs.io/en/release-1.4/install.html)
* [docker](https://docs.docker.com)
* [cURL](http://curl.haxx.se/download.html)
* [goLang](https://golang.org/dl/) (follow also the guide to reach the *gopath* folder via the PATH environment variable)
* [node](https://nodejs.org) (tested with v10.19.0 and v12.18.3)
* *software-properties-common*, *gcc*, *g++* and *make*.

## Installation (linux)

1.	Install requirements:

```shell
sudo apt install software-properties-common gcc g++ make docker.io docker-compose npm nodejs golang
sudo usermod -aG docker $USER
```

Log out and back in for the group evaluation to take effect. If running in a virtual machine, you may need to restart it instead.

2. Install [Hyperledger Fabric Binaries and docker images v.1.4.8](https://hyperledger-fabric.readthedocs.io/en/release-1.4/install.html)
```shell
curl -sSL http://bit.ly/2ysbOFE | bash -s -- 1.4.8 1.4.8 0.4.21
````

3. Add the following line to ~\/.profile:

```shell
export PATH=<path to fabric-samples location>/bin:$PATH
```

where the ''path to download location'' is the path to the ''fabric-samples'' directory downloaded with cUrl, above. For go version less than 1.13, also add `export PATH=$PATH:$GOPATH/bin`; newer versions do not require this.

```shell
source ~/.profile
```
or log out and back in to apply changes.

The YAML files are configured to run the docker images tagged as *latest*: if Hyperledger containers are updated, modify the YAML files to select v.1.4.8 images (e.g., *hyperledger/fabric-ca:x86_64-1.4.8* instead of *hyperledger/fabric-ca*). 

4.	Download (or clone) the Healthcare\_scenario in this repo.

5.	`npm install` in your Healthcare\_scenario folder.

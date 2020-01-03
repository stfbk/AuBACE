# The Audit-Based Access Control Enforcement (AuBACE) framework

Controlled information sharing in organizations is essential to prevent unauthorized disclosure and malicious or accidental unauthorized changes to data, while ensuring accessibility by authorized users whenever needed: i.e., grant availability of data while ensuring its confidentiality and integrity.

Given the diffusion and impact of insider attacks, and the constraints and guarantees introduced by privacy regulations (e.g. GDPR), we propose a framework that employs the Hyperledger Fabric Distributed Ledger Technology (DLT) to guarantee the strong integrity of the audit log, a single point of policy administration, and the efficient and distributed enforcement of policies with less trust in administrators.

Additional information can be found at [sites.google.com/fbk.eu/aubace](https://sites.google.com/fbk.eu/aubace).

## Usage
To run our Healthcare use case, use the launcher *start.sh* and follow the instructions; to stop it, use *stop.sh* (Linux) or *stop-win.bat* (Windows). A testing dashboard is available at *localhost:8000*.

## Requirements

The core requirements are derived from Hyperledger Fabric, with smart contracts written in go and client software in nodejs.

* [Hyperledger Fabric v.1.4.4](https://hyperledger-fabric.readthedocs.io/en/release-1.4/install.html)
* [docker](https://docs.docker.com)
* [cURL](http://curl.haxx.se/download.html)
* [goLang](https://golang.org/dl/) (follow also the guide to reach the *gopath* folder via the PATH environment variable)
* [node v. 8.16](https://nodejs.org/dist/latest-v8.x)
* *software-properties-common*, *gcc*, *g++* and *make*.

## Installation (linux)

1.	Install requirements:

```shell
sudo apt install python-software-properties gcc g++ make docker.io docker-compose npm nodejs golang
sudo usermod -aG docker $USER
```

Log out and back in for the group evaluation to take effect. If running in a virtual machine, you may need to restart it instead.

2. Install [Hyperledger Fabric Binaries and docker images v.1.4.4](https://hyperledger-fabric.readthedocs.io/en/release-1.4/install.html)
```shell
curl -sSL http://bit.ly/2ysbOFE | bash -s -- 1.4.4 1.4.4 0.4.8
````

3. Add the following lines to ~\/.profile:

```shell
export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin
export PATH=<path to fabric-samples location>/bin:$PATH
'''

where the ''path to download location'' is the path to the ''fabric-samples'' directory downloaded with cUrl, above.

```shell
source ~/.profile
```
or log out and back in to apply changes.

The YAML files are configured to run the docker images tagged as *latest*: if Hyperledger containers are updated, modify the YAML files to select v.1.4.4 images (e.g., *hyperledger/fabric-ca:x86_64-1.4.4* instead of *hyperledger/fabric-ca*). 

4.	Download (or clone) the Healthcare\_scenario in this repo.

5.	`npm install` in your Healthcare\_scenario folder.


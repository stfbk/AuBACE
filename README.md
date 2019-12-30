# The Audit-Based Access Control Enforcement (AuBACE) framework

Controlled information sharing in organizations is essential to prevent unauthorized disclosure and malicious or accidental unauthorized changes to data, while ensuring accessibility by authorized users whenever needed: i.e., grant availability of data while ensuring its confidentiality and integrity.

Given the diffusion and impact of insider attacks, and the constraints and guarantees introduced by privacy regulations (e.g. GDPR), we propose a framework that employs the Hyperledger Fabric Distributed Ledger Technology (DLT) to guarantee the strong integrity of the audit log, a single point of policy administration, and the efficient and distributed enforcement of policies with less trust in administrators.

Additional information can be found at [sites.google.com/fbk.eu/aubace](https://sites.google.com/fbk.eu/aubace).

## Usage
To run our Healthcare use case, use the launcher *start.sh* and follow the instructions; to stop it, use *stop.sh* (Linux) or *stop-win.bat* (Windows). A testing dashboard is available at *localhost:8000*.

## Requirements

The core requirements are derived from Hyperledger Fabric.

* [Hyperledger Fabric v.1.4.4](https://hyperledger-fabric.readthedocs.io/en/release-1.4/install.html)
* [docker](https://docs.docker.com)
* [cURL](http://curl.haxx.se/download.html)
* [goLang](https://golang.org/dl/) (follow also the guide to reach the *gopath* folder via the PATH environment variable)
* [node v. 8.16](https://nodejs.org/dist/latest-v8.x)
* *software-properties-common*, *gcc*, *g++* and *make*.

## Installation (linux)

1.	Install [docker](https://docs.docker.com)

```shell
sudo apt install python-software-properties gcc g++ make docker.io docker-compose nodejs golang
sudo usermod -a -G docker $USER
``` 
Logout to apply changes.

2. Install [Hyperledger Fabric Binaries and docker images v.1.4.4](https://hyperledger-fabric.readthedocs.io/en/release-1.4/install.html)
```shell
curl -sSL http://bit.ly/2ysbOFE | bash -s -- 1.4.4 1.4.4 0.4.8
````

Add the *bin* subfolder to the PATH environment variable: open \/.profile and add `export PATH=<path to download location>/bin:$PATH`. The ''path to download location'' is the path to the ''fabric-samples'' directory that the cUrl command downloaded.

```shell
source ~/.profile
```
or log out and back in.

The YAML files are configured to run the docker images tagged as *latest*: if Hyperledger containers are updated, modify the YAML files to select v.1.4.4 images (e.g., *hyperledger/fabric-ca:x86_64-1.4.4* instead of *hyperledger/fabric-ca*). 

3.	Download (or clone) the Healthcare\_scenario in this repo.

4.	`npm install` in your Healthcare\_scenario folder.


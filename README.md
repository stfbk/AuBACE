# The Audit-Based Access Control Enforcement (AuBACE) framework

Controlled information sharing in organizations is essential to prevent unauthorized disclosure and malicious or accidental unauthorized changes to data, while ensuring accessibility by authorized users whenever needed: i.e., grant availability of data while ensuring its confidentiality and integrity.
Given the diffusion and impact of insider attacks, and the constraints and guarantees introduced by privacy regulations (e.g. GDPR), we propose a framework that employs the Hyperledger Fabric Distributed Ledger Technology (DLT) to guarantee the strong integrity of the audit log, a single point of policy administration, and the efficient and distributed enforcement of policies with less trust in administrators.
Additional information can be found at https://sites.google.com/fbk.eu/aubace.

## Usage
To run our Healthcare use case, use the launcher *start.sh* and follow the instructions; to stop it, use *stop.sh* (Linux) or *stop-win.bat* (Windows). A testing dashboard is available at *localhost:8000*.

### Requirements
1.	[Docker](https://docs.docker.com) (remember to issue `sudo usermod -a -G docker $USER` and logout to apply changes);
[cURL](http://curl.haxx.se/download.html); [goLang](https://golang.org/dl/) (follow also the guide to reach the *gopath* folder via the PATH environment variable); [node v. 8.16](https://nodejs.org/dist/latest-v8.x). In addition, *software-properties-common*, *gcc*, *g++* and *make* with, for instance, `sudo apt install python-software-properties gcc g++ make`.
2. Install [Hyperledger Fabric Binaries and docker images v.1.1.0](https://hyperledger-fabric.readthedocs.io/en/release-1.4/install.html) with `curl -sSL http://bit.ly/2ysbOFE | bash -s -- 1.1.0 1.1.0 0.4.6`. Verify that docker-compose is installed and add the *bin* subfolder to the PATH environment variable: open \/.profile and add `export PATH=<path to download location>/bin:$PATH`. The ''path to download location'' is the path to the ''fabric-samples'' directory that the cUrl command downloaded. Finally issue `source ~/.profile`. The YAML files are configured to run the docker images tagged as *latest*: if Hyperledger containers are updated, modify the YAML files to select v.1.1.0 images (e.g., *hyperledger/fabric-ca:x86_64-1.1.0* instead of *hyperledger/fabric-ca*). 
3.	Download (or clone) the Healthcare\_scenario.
4.	Run npm install in the Healthcare\_scenario folder.

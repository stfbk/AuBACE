#The Audit-Based Access Control Enforcement (AuBACE) framework

Controlled information sharing in organizations is essential to prevent unauthorized disclosure and malicious or accidental unauthorized changes to data, while ensuring accessibility by authorized users whenever needed: i.e., grant availability of data while ensuring its confidentiality and integrity.
Given the diffusion and impact of insider attacks, and the constraints and guarantees introduced by privacy regulations (e.g. GDPR), we propose a framework that employs the Hyperledger Fabric Distributed Ledger Technology (DLT) to guarantee the strong integrity of the audit log, a single point of policy administration, and the efficient and distributed enforcement of policies with less trust in administrators.
Additional information can be found at https://sites.google.com/fbk.eu.

## Usage
To run our Healthcare use case, use the launcher *start.sh* and follow the instructions; to stop it, use *stop.sh* (Linux) or *stop-win.bat* (Windows). A testing dashboard is available at [localhost:8000](localhost:8000).

### Requirements
1.	[Docker](https://docs.docker.com); [cURL](http://curl.haxx.se/download.html); [goLang](https://golang.org/dl/); [node v. 8.16](https://nodejs.org/dist/latest-v8.x).
2. Install [Hyperledger Fabric Binaries and docker images v.1.1.0](https://hyperledger-fabric.readthedocs.io/en/release-1.4/install.html) with `curl -sSL http://bit.ly/2ysbOFE | bash -s -- 1.1.0 1.1.0 0.4.6`. Verify that docker-compose is installed and add the *bin* subfolder to the PATH environment variable: open \/.profile and add `export PATH=<path to download location>/bin:$PATH`. The ''path to download location'' is the path to the ''fabric-samples'' directory that the cUrl command downloaded. Finally issue `source ~/.profile`.
4.	Download (or clone) the Healthcare\_scenario next to Hyperledger Fabric samples.
5.	Run npm install in the Healthcare\_scenario folder. If using Windows, remove the node modules *grpc*, *fabcric-client* and *fabric-ca-client* from the node_modules folder and npm install the following (from Healthcare\_scenario): grpc@1.10.1, fabric-ca-client@1.1.0 and fabric-ca@1.1.0.

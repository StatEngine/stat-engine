# StatEngine

StatEngine is a fire service analytical system, the most comprehensive way to get accurate and real-time information to help fire service leaders assure adequate fire resources, optimize fire operations, reduce firefighter injury and death, minimize civilian injury and death, and minimize property loss.  More information about funding and background is available [here](https://www.nist.gov/ctl/pscr/real-time-open-source-data-analytics-and-visualization-platform).

## Getting Started

### Prerequisites

Ensure the following packages are installed
- [Git](https://git-scm.com/downloads)
- [Node.js and npm](https://nodejs.org) Node v8.x.x ONLY (really, just use v8.17.0 specifically. see Note at bottom), npm >= 6.5.x
  - installing [NVM](https://github.com/nvm-sh/nvm) is HIGHLY recommended, since running StatEngine requires an older version of Node
- [PostSQL](https://www.postgresql.org/download/) 9.6.5
- [Elasticsearch](https://www.elastic.co/downloads/past-releases/elasticsearch-6-4-1) 6.4.1
- [Java JDK](https://www.oracle.com/java/technologies/javase/javase-jdk8-downloads.html) 8.x.x


1.  Run `npm install --global gulp`

1.  Run `npm install --global elasticdump@4.4.0`

1.  Run `brew install pkg-config cairo pango libpng jpeg giflib`

1.  (Linux) Run `apt-get install -y libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++`

#### PostgreSQL Setup

1. Create user in PostgreSQL (username: `statengine`, password: `statengine`)

1. Create `statengine` database in PostgreSQL

#### Elasticsearch Setup

1.  Navigate to your Elasticsearch install directory  (ex. `cd elasticsearch-6.4.1`)

2.  Download Readonly Rest Plugin for 6.4.1 by requesting a download at https://readonlyrest.com/download/

3.  Install readonlyrest plugin
```
bin/elasticsearch-plugin install file:///<location of download>
```

4.  Configure readonlyrest plugin, copy the following into a new file called in ```config/readonlyrest.yml```
```
readonlyrest:
  enable: true
  prompt_for_basic_auth: false

  access_control_rules:

  - name: "::USR-KIBANA-RO-STRICT::"
    kibana_access: ro_strict
    kibana_index: ".kibana_@{user}"
    indices: [".kibana", ".kibana-devnull", ".kibana_@{user}", "@{x-se-fire-department-all}"]
    kibana_hide_apps: ["readonlyrest_kbn", "kibana:dev_tools"]
    jwt_auth:
     name: "jwt1"
     roles: ["kibana_ro_strict"]

  - name: "::USR-KIBANA::"
    kibana_access: admin
    kibana_index: ".kibana_@{user}"
    indices: [".kibana", ".kibana-devnull", ".kibana_@{user}", "@{x-se-fire-department-all}"]
    kibana_hide_apps: ["readonlyrest_kbn", "kibana:dev_tools"]
    jwt_auth:
     name: "jwt1"
     roles: ["kibana_admin"]

  - name: "::KIBANA::"
    auth_key: kibana:kibana
    verbosity: info

  jwt:
    - name: jwt1
      signature_algo: 'HMAC'
      signature_key: 'woEayHiICafruph^gZJb3EG5Fnl1qou6XUT8xR^7OMwaCYxz^&@rr#Hi5*s*918tQS&iDJO&67xy0hP!F@pThb3#Aymx%XPV3x^'
      user_claim: 'firecares_id'
      roles_claim: 'roles'
```
5.  Add the following to config/elasticsearch.yml
```
http.cors.enabled: true
http.cors.allow-origin: "*"
script.painless.regex.enabled: true

xpack.graph.enabled: false
xpack.ml.enabled: false
xpack.monitoring.enabled: false
xpack.security.enabled: false
xpack.watcher.enabled: false
```

6. Run `.\bin\elasticsearch`

### Running Kibana

1.  Run the preconfigured Kibana instance
```
on Linux:
docker run -e ELASTICSEARCH_URI=http://localhost:9200 --net=host prominentedgestatengine/kibana:HEAD-c7f45bd-development

on Mac:
docker run -e ELASTICSEARCH_URI=http://host.docker.internal:9200 -p 5601:5601 prominentedgestatengine/kibana:HEAD-c7f45bd-development
```

### Loading Elasticsearch Test Data

#### Nightly Dump

A nightly dump of elasticdump data is available in S3.   Please contact a team member for access.

#### Loading data

1. Make sure Elasticsearch is running

2. Run `multielasticdump --input="./es-test-data" --output="http://kibana:kibana@localhost:9200" --direction="load"`

### MinIO
MinIO is an object storage server released under Apache License v2.0. It is compatible with Amazon S3 cloud storage service and therefore the `aws-sdk` module can be pointed to it locally without the need of having a dedicated S3 bucket for development purposes.

#### Run minIO
The recommended way to set up MinIO is to run it from a docker container.

```bash
docker run -p 9090:9000 -e "MINIO_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE" -e"MINIO_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" minio/minio server /data
```

#### Go to minIO dashboard
```http://localhost:9090```
Create a new bucket called `statengine-public-assets-dev`.

Edit the policy, allowing Read and Write access with prefix `*`

### Developing

1.  Run `git clone https://github.com/StatEngine/stat-engine.git`

2.  Obtain **env.json** secrets file from development team and copy to the root of **stat-engine** directory

3.  Run `npm install`

4.  Run `gulp seed:dev` to populate the database.

5.  Run `gulp serve` to start the development server. It should automatically open the client in your browser when ready.

6.  Login with username: `richmond`, password: `password`.

7. To test against the prod elasticsearch data
  - run `kubectl get pods`
  - look for elasticsearch client pods. eg: `elasticsearch-elasticsearch-client-64f89475f9-brt6w`
  - run `kubectl port-forward <podName> <myPort>:9200` eg: `kubectl port-forward elasticsearch-elasticsearch-client-64f89475f9-brt6w 8080:9200`
  - in env.json, you will need to add the env var: `ELASTICSEARCH_URI`, `ELASTICSEARCH_USER`, `ELASTICSEARCH_PASSWORD`
  - user and password are in 1Password
  - uri will be `localhost:8080` (or whatever port you used in the `kubectl port-forward` command)

#### Note
  - If you get strange errors when running either `npm install` or `gulp serve`, your problem is most likely a wrong node version.
  - You MUST be using v8.x.x
  - Run `nvm ls` (assuming you are using `nvm`), and see what versions you have installed and what version is currently in use
  - It will often be set to the `system` version. You just have to change it to whatever 8.x.x you have installed
  - For example, if you have v8.17.0 installed, then run `nvm use 8.17.0`

### Testing
Stat-Engine uses [BrowserStack](https://www.browserstack.com/contact#open-source) for compatibility testing.
![](https://s3.amazonaws.com/statengine-public-assets/Browserstack-logo%402x.png)

Note for running tests for NodeJs code in server - to just run a single test, run this command:
`npx mocha --compilers js:babel-register path/to/test`

example: `npx mocha --compilers js:babel-register server/api/email/sendNotification.integration.spec.js`

### Mandrill Templates

The `email` folder is used for Mandrill templates, during CI it deploys and uploads any changes.

If you want to add a new template, create it in Mandrill then create a file in the `email` folder with the filename as the slug then run the upload script, or deploy.


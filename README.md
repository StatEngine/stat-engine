# StatEngine

StatEngine is a fire service analytical system, the most comprehensive way to get accurate and real-time information to help fire service leaders assure adequate fire resources, optimize fire operations, reduce firefighter injury and death, minimize civilian injury and death, and minimize property loss.  More information about funding and background is available [here](https://www.nist.gov/ctl/pscr/real-time-open-source-data-analytics-and-visualization-platform).

## Getting Started

### Prerequisites

Ensure the following packages are installed
- [Git](https://git-scm.com/downloads)
- [Node.js and npm](https://nodejs.org) Node >= 8.x.x, npm >= 6.5.x
- [PostSQL](https://www.postgresql.org/download/) 9.6.5
- [Elasticsearch](https://www.elastic.co/downloads/past-releases/elasticsearch-6-4-1) 6.4.1


1.  Run `npm install --global gulp`

1.  Run `npm install --global elasticdump`

1.  Run `brew install pkg-config cairo pango libpng jpeg giflib`

1.  (Linux) Run `apt-get install -y libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++`

#### PostgreSQL Setup

1. Create user in PostgreSQL (username: `statengine`, password: `statengine`)

1. Create `statengine` database in PostgreSQL

#### Elasticsearch Setup

1.  Navigate to your Elasticsearch install directory  (ex. `cd elasticsearch-6.4.1`)

2.  Download Readonly Rest Plugin here: https://github.com/sscarduzio/elasticsearch-readonlyrest-plugin/archive/v1.16.33_es6.4.1.zip

3.  Install readonlyrest plugin
```
bin/elasticsearch-plugin install file:///<location of download>
```

4.  Configure readonlyrest plugin, copy the following into favorite editor and save in config/readonlyrest.yml
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

5. Run `.\bin\elasticsearch`

### Running Kibana

1.  Run preconfigured kibana
```
docker run -p 5601:5601 prominentedgestatengine/kibana:HEAD-c7f45bd-development
```

### Loading Elasticsearch Test Data

#### Nightly Dump

A nightly dump of elasticdump data is availabe in S3.   Please contact a team member for access. 

#### Loading data

1. Make sure Elasticsearch is running

2. Run `multielasticdump --input="./es-test-data" --output="http://localhost:9200" --direction="load"`

### Developing

1.  Run `git clone https://github.com/StatEngine/stat-engine.git`

2.  Obtain **env.json** secrets file from development team and copy to the root of **stat-engine** directory

3.  Run `npm install`

4.  Run `gulp serve` to start the development server. It should automatically open the client in your browser when ready.

5.  Login with username: `richmond`, password: `password`.

### Testing
Stat-Engine uses [BrowserStack](https://www.browserstack.com/contact#open-source) for compatibility testing. 
![](https://s3.amazonaws.com/statengine-public-assets/Browserstack-logo%402x.png)



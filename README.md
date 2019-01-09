# StatEngine

## Getting Started

### Prerequisites

Ensure the following packages are installed
- [Git](https://git-scm.com/)
- [Node.js and npm](nodejs.org) Node >= 8.x.x, npm >= 6.5.x
- [PostSQL](https://www.postgresql.org/) 9.6.5
- [Elasticsearch](https://www.postgresql.org/) 6.4.2

1.  Run `npm install --global gulp`

2.  Run `npm install --global elasticdump`

3.  Run `brew install pkg-config cairo pango libpng jpeg giflib`

#### PostgreSQL Setup

1. Create user in PostgreSQL (username: `statengine`, password: `statengine`)

2. Create `statengine` database in PostgreSQL

#### Elasticsearch Setup

1.  Navigate to Elasticsearch directory `cd elasticsearch`

2.  Run `.\bin\elasticsearch`

### Loading ES Test data

#### Nightly Dump

A nightly dump of elasticdump data will be availabe in S3.
In the meantime, you can obtain sample data from another developer.

#### Loading data

```
multielasticdump --input=".\test-es-data" --output="http://localhost:9200" --direction="load"
```

### Developing

1.  Run `git clone https://github.com/StatEngine/stat-engine.git`

2.  Obtain **env.json** secrets file from development team and copy to the root of stat-engine directory

3.  Run `npm i`

4.  Run `gulp serve` to start the development server. It should automatically open the client in your browser when ready.

5.  Login with username: `richmond`, password: `password`.


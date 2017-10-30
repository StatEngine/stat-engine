# StatEngine

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js and npm](nodejs.org) Node >= 4.x.x, npm >= 2.x.x
- [Gulp](http://gulpjs.com/) (`npm install --global gulp`)
- [SQLite](https://www.sqlite.org/quickstart.html)

### Developing

1. Run `npm install` to install server dependencies.

2. Run `gulp serve` to start the development server. It should automatically open the client in your browser when ready.

## Build & development

Run `gulp build` for building and `gulp serve` for preview.

## Testing

Running `npm test` will run the unit tests with karma.

## Docke

### Building
`docker build -t stat-engine .`

### Running
`docker run -p 80:8080 stat-engine`

App is available at http://localhost:80

## Local Kibana on MacOSX
```
brew install elasticsearch
brew install kibana
brew services start elasticsearch
echo 'server.basePath: "/_plugin/kibana"' >> /usr/local/etc/kibana/kibana.yml
brew services start kibana
```

## Use AWS Kibana
TODO

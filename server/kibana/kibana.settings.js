'use strict';

import config from '../config/environment';

var crypto      = require('crypto');
var querystring = require('querystring');
var url         = require('url');

// Hmac for signing requests
var hmac = function (key, data, encoding) {
  return crypto.createHmac('sha256', key)
               .update(data, 'utf8')
               .digest(encoding);
}

// Hash for creating the canonical request to sign
var hash = function (data, encoding) {
  return crypto.createHash('sha256')
               .update(data, 'utf8')
               .digest(encoding);
};

// AWS requires are query params to be sorted in the canonical request.
var KeyValue = function (key, value) {
  this.key = key;
  this.value = value;
};
KeyValue.prototype = {
  toString: function() {
    return encodeURIComponent(this.key) + '=' + encodeURIComponent(this.value);
  }
};
var sortedQuery = function (qs) {
  var obj = querystring.parse(qs);
  var query = [];
  for (var key in obj) {
    if (key in obj) {
      query.push(new KeyValue(key, obj[key]))
    }
  }

  query.sort(function(a, b){ return a.key < b.key ? -1 : 1 });
  return query.join('&');
}

// Builds the signed authentication headers.
var authHeaders = function (req) {
  var parsed = url.parse(req.url)
  var pathname = parsed.pathname.indexOf(config.kibana.appPath) === -1 ? config.kibana.appPath + parsed.pathname : parsed.pathname
  var date = new Date();
  var kibana = url.parse(config.kibana.uri)
  var iso8601 = date.toISOString().replace(/[:\-]|\.\d{3}/g, '');
  var calDate = iso8601.substring(0,8);
  var scope = calDate + '/' + config.aws.region + '/es/aws4_request';
  var credential = config.aws.accessKeyId + '/' + scope;
  var bodyHash = req.method === 'GET' ? hash('', 'hex') : hash(JSON.stringify(req.body), 'hex');
  var canonicalRequest = [ req.method,
                           encodeURI(pathname).replace(/\*/g, '%2A'),
                           parsed.query ? sortedQuery(parsed.query) : '',
                           'host:' + kibana.host + '\n',
                           'host',
                           bodyHash
                         ].join('\n');
  var stringToSign = [ 'AWS4-HMAC-SHA256',
                        iso8601,
                        scope,
                        hash(canonicalRequest, 'hex')
                     ].join('\n');

  // Signature
  var keyDate    = hmac('AWS4' + config.aws.secretAccessKey, calDate);
  var keyRegion  = hmac(keyDate, config.aws.region);
  var keyService = hmac(keyRegion, 'es');
  var signingKey = hmac(keyService, 'aws4_request');
  var signature  = hmac(signingKey, stringToSign, 'hex');

  return {
    "Authorization": 'AWS4-HMAC-SHA256 Credential=' + credential + ', SignedHeaders=host, Signature=' + signature,
    "X-Amz-Date": iso8601
  }
}

// Proxy Settings
var settings = {
  uri: config.kibana.uri,
  // Do not send data with a GET request, kibana doesn't like it.
  proxyReqBodyDecorator: function(bodyContent, srcReq) {
    return srcReq.method === 'GET' ? '' : bodyContent
  },
  // modify the app path
  proxyReqPathResolver: function(srcReq) {
    var parsed = url.parse(srcReq.url);
    return parsed.path.indexOf(config.kibana.appPath) === -1 ? config.kibana.appPath + parsed.path : parsed.path
  }
};

// If Kibana is hosted by Amazon, we'll need to sign the request.
if (config.kibana.uri.indexOf('amazonaws') !== -1) {
  settings['proxyReqOptDecorator'] = function(proxyReqOpts, srcReq) {
    var headers = authHeaders(srcReq);
    proxyReqOpts.headers['Authorization'] = headers['Authorization'];
    proxyReqOpts.headers['X-Amz-Date'] = headers['X-Amz-Date'];
    return proxyReqOpts;
  }
}
export default settings

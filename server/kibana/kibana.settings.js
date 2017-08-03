'use strict';

import config from '../config/environment';

var crypto      = require('crypto');
var querystring = require('querystring');
var url         = require('url');
var AWS         = require('aws-sdk');

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

var init = AWS.config.getCredentials(function (err) {
  if (err) console.log(err);
});

// Builds the signed authentication headers.
var authHeaders = function (req) {
  var refresh = AWS.config.getCredentials(function (err) {
    if (err) console.log(err);
  });
  var creds = AWS.config.credentials;
  var parsed = url.parse(req.url);
  var pathname = parsed.pathname.indexOf(config.kibana.appPath) === -1 ? config.kibana.appPath + parsed.pathname : parsed.pathname;
  var date = new Date();
  var kibana = url.parse(config.kibana.uri);
  var region = kibana.host.match(/\.([^.]+)\.es\.amazonaws\.com\.?$/)[1] || config.aws.region;
  var iso8601 = date.toISOString().replace(/[:\-]|\.\d{3}/g, '');
  var calDate = iso8601.substring(0,8);
  var scope = calDate + '/' + region + '/es/aws4_request';
  var credential = creds.accessKeyId + '/' + scope;
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
  var keyDate    = hmac('AWS4' + creds.secretAccessKey, calDate);
  var keyRegion  = hmac(keyDate, region);
  var keyService = hmac(keyRegion, 'es');
  var signingKey = hmac(keyService, 'aws4_request');
  var signature  = hmac(signingKey, stringToSign, 'hex');

  var headers = {
    "Authorization": 'AWS4-HMAC-SHA256 Credential=' + credential + ', SignedHeaders=host, Signature=' + signature,
    "X-Amz-Date": iso8601
  }

  if (creds.sessionToken) {
    headers['X-Amz-Security-Token'] = creds.sessionToken;
  }

  return headers
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
    proxyReqOpts.headers['Authorization']        = headers['Authorization'];
    proxyReqOpts.headers['X-Amz-Date']           = headers['X-Amz-Date'];
    if (headers['X-Amz-Security-Token']) {
      proxyReqOpts.headers['X-Amz-Security-Token'] = headers['X-Amz-Security-Token'];
    }
    return proxyReqOpts;
  }
}
export default settings

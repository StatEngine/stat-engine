'use strict';

require('babel-polyfill');

// Register the Babel require hook
require('babel-core/register');

const chai = require('chai');

// Load globals
global.expect = chai.expect;
global.sinon = require('sinon');

// Initialize Chai plugins
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));
chai.use(require('chai-things'));

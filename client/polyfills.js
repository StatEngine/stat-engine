// Polyfills
import 'babel-polyfill';

if(!ENV) {
  var ENV = 'development';
}

if(ENV === 'production') {
  // Production
} else {
  // Development
  Error.stackTraceLimit = Infinity;
}

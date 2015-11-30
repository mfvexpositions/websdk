// Expose jQuery globally as a specific version (do not use the global version)
// In order to use it, the app needs the top element to have ng-jq='jquery21'
// To keep order of sequence we use RequireJS
var jquery      = require('jquery');
window.jquery21 = jquery;
require('angular');

// Load other libraries
// require('some-lib-wrapped')(window, jquery);

// Reference more libraries (ideally these do not use the global scope)
import 'lodash';

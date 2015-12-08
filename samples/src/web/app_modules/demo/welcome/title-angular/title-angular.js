require('./title-angular.less');

var tmpl = require('./title-angular.htm');

// Imports
import lib from 'demo/lib';
import objectExtend from 'lodash/object/extend'; // Cause this is a sample

// Classes are just sugar, technically they are stil a good'ol Function :)
class TitleAngular {
  constructor($scope){
    debug('Yep, this is a normal angular 1.x controller, use this instead of link functions. Unless you need to deal with the DOM');
    
    // Only cause it is a demo
    var obj = objectExtend({me:1},{me:2});
    debug('Extend output',obj);
  }
}
var controller = ['$scope',TitleAngular];

// By convention adding components is done through libs
// libs are simple wrappers with enough flexibility to
// ease the usage of lazy loading, the provide delayed
// callbacks, until an app is ready to start or are added
// as soon as they become available
lib.addComponent('titleAngular',{
  template    : tmpl
  ,controller : controller
  ,scope      : {
    label : '=' // Make it two way binding
  }
});

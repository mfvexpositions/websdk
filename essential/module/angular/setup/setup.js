
import objExtend from 'lodash/object/extend';
import * as Ensure from './ensure';
import Debug from '../../../log';

var debug = Debug('essential:module:angular:setup')

export default function setup(lib, config, settings){
  // Get a reference to the app
  var ngApp = config.ngApp;

  // Inform about the setup setup
  debug(`Setting up angular library compatibility and lazy loading for ${settings.name}`);

  // Configure the module
  ngApp.config([
    '$controllerProvider'
    ,'$compileProvider'
    ,'$filterProvider'
    ,'$provide'
    ,($controllerProvider,$compileProvider,$filterProvider,$provide)=>{
      // save refeerences to the providers so we can lazy load items later
      objExtend(ngApp, {
        controller : $controllerProvider.register
        ,directive : $compileProvider.directive
        ,filter    : $filterProvider.register
        ,factory   : $provide.factory
        ,service   : $provide.service
        ,provider  : $provide.provider
      })
    }
  ])

  // Configure the module
  ngApp.run([
    '$rootScope'
    ,($rootScope)=>{
      $rootScope.settings = settings;
    }
  ]);

  // Perform a few imports
  // Add knowledge about <ensure>
  Ensure.setup(lib, config, settings);
}


import objExtend from 'lodash/extend';
import * as Ensure from './ensure';
import Debug from '../../../log';

var debug = Debug('essential:module:angular:setup')

export default function setup(lib, config, settings){
  // Get a reference to the app
  var ngApp = config.ngApp;

  // Inform about the setup setup
  debug(`Setting up angular library compatibility and lazy loading for ${settings.name}`);

  // Alter local angular reference
  var
    angular = config.angular
    ,availableModules = {}
    ,alteredAngular = objExtend({},angular,{
      // Save the original angular module
      _module : angular.module

      // TODO: Is it possible to implement config phase?
      // REVIEW: This flattens every module, and their injector (how much does this affect performance, and does it affect in "module separation"?)
      ,module: function module(name, requires, configFn){
        var module;

        // If  we already have the module name then use it, otherwise create it
        if( availableModules.hasOwnProperty(name) ) module = availableModules[name];
        else availableModules[name] = module = makeDependencyModule(name, lib, ngApp);

        // Return the module
        return module;
      }
    })
  ;

  // Provide the lib and the config with a reference to the altered angular
  config.angular = lib.angular = alteredAngular;

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



// Expose a new module creator that basically just proxies everything into the current app
// REVIEW: This flattens every module, and their injector (hom much does this affect performance, and does it affect in "module separation"?)
function makeDependencyModule(name, lib, ngApp){
  var dependencyModule = {
    name : name
    ,factory: function(){
      ngApp.factory.apply(null, arguments);
      return dependencyModule;
    }
    ,directive: function(){
      ngApp.directive.apply(null, arguments);
      return dependencyModule;
    }
    ,filter: function(){
      ngApp.filter.apply(null, arguments);
      return dependencyModule;
    }
    ,controller: function(){
      ngApp.controller.apply(null, arguments);
      return dependencyModule;
    }
    ,provider: function(){
      ngApp.provider.apply(null, arguments);
      return dependencyModule;
    }
    ,service: function(){
      ngApp.service.apply(null, arguments);
      return dependencyModule
    }
    ,run: function(block){
      lib.preRegister(function runModule(config, settings){
        lib.injector.invoke(block);
      });
      return dependencyModule;
    }
    ,value: function(){
      ngApp.value.apply(null, arguments);
      return dependencyModule;
    }
    ,contant: function(){
      ngApp.constant.apply(null, arguments);
      return dependencyModule;
    }
    ,animation: function(){
      ngApp.animation.apply(null, arguments);
      return dependencyModule;
    }
    // TODO only config() is not working
    ,config: function(block){
      console.warn('Feature is not available. Config is not supported for modules registered after this ComponentModule. Use angular._module, or adding directly to initial dependencies.',block);
      // console.warn('Invoking config and if done async this will prob fail')
      // lib.preRegister(function runModule(config, settings){
      //   lib.injector.invoke(block);
      // });
      return dependencyModule;
    }
  }
}


import objectExtend from 'lodash/extend';
import setup from './setup';
import Debug from '../../log';

var debug = Debug('essential:module:angular');

export class AngularModule {
  /**
   * @param  {Object} The config object which should contain the references to the frameworks being used, like { angular: importFromAngularReferenceOrGlobal }
   * @param  {Object} The settings object from a settings.yaml
   * @param  {AngularLib} An AgularLib instance
   * @param  {String} The template string for the module
   * @param  {autoload} Should the module automatically start
   * @return {AngularModule} the AngularModule instance
   */
  constructor( config, settings, lib, tmpl, autoload ){
    // By default the app will be autoloaded on DOM ready
    if(autoload!==false) autoload = true;

    this.tmpl     = tmpl;
    this.lib      = lib; // keep a reference to the library
    this.config   = config;
    this.ngApp    = undefined;
    this.injector = undefined; // to be provided when bootstrapping

    // The config are a requirment
    if(!this.config.angular){
      throw new Error(`
        Angular is missing. You must provide config as the 1st parameter when creating an AngularModule.
        Please use the pattern { angular: require('angular') }, you may also need to include other config like jquery
      `)
    }

    try { this.ngApp = this.config.angular.module(settings.name) }
    catch(e){ this.ngApp = this.config.angular.module(settings.name, settings.dependencies||[]) }

    // Config is the currenlty running configuration to which any app module/lib would be added
    this.lib.injector = undefined;
    this.config       = objectExtend(config, {
      ngApp     : this.ngApp
      ,injector : this.injector // To be provided when bootstrapping
    });

    // Settings are the properties for the module regardless of where it is being incorporated
    this.settings = settings;

    // =========================================================================

    // Configure the ngApp
    debug(`Preparing ${settings.name} at <${settings.selector}></${settings.selector}>`);
    setup(this.lib, this.config, this.settings);

    // Now that the app is ready we can configure the rest of the library
    // IMPORTANT: The main files should never depend on the app to have been attached to the DOM yet
    // and if for some reason they ever do, then set them in a different bundle
    debug(`Starting ${this.settings.name} at <${settings.selector}></${settings.selector}>`);
    this.lib.init(this.config, this.settings);

    // Schedule the loading of the app
    autoload && this.scheduleInit();
  }

  // To have a custom initialization other the DOMContentLoaded, extend the class and add an init method
  scheduleInit(){

    // If this object has an initializer perform that and exit
    if(this.init){
      var self = this;
      self.init(this.ngApp, function initDone(injector){
        // Notify about our action
        debug(`Booting ${self.settings.name} at ${self.settings.selector}`, self.settings);

        // Set the injector
        self.config.injector = self.lib.injector = self.injector = injector;

        // Add a few more propertie to the ngApp, like an easy way to get services instead of going through
        // lib.injector.get -> ngApp.getService
        var moduleNode = document.querySelector(self.settings.selector);
        if(!moduleNode) {
          var msg = `Did not find a tag "<${self.settings.selector}>" on which to initiate the app`;
          debug(msg);
          if(console&&console.warn) console.warn(msg);
          return;
        }

        // Enhance the ngApp
        self.enhanceNgApp(moduleNode);
      });

      // Exit, as a custom initializer exists
      return;
    }

    // Bootstrap the app until all dom elements are loaded
    document.addEventListener('DOMContentLoaded',()=>{
      // Notify about our action
      debug(`Booting ${this.settings.name} at ${this.settings.selector}`, this.settings);

      // Bootstrap the this.ngApp using the selector (should be a tag name)
      var moduleNode = document.querySelector(this.settings.selector);
      if(!moduleNode) {
        var msg = `Did not find a tag "<${this.settings.selector}>" on which to initiate the app`;
        debug(msg);
        if(console&&console.warn) console.warn(msg);
        return;
      }

      // If we have a moduleNode then bootstrap the app there
      if(this.tmpl) moduleNode.innerHTML = this.tmpl;
      this.config.injector = this.lib.injector = this.injector = this.config.angular.bootstrap(moduleNode,[this.settings.name]);

      // Enhance the ngApp
      this.enhanceNgApp(moduleNode);
    });
  }

  // Add properties to the angular.module instance $element, getService, etc...
  enhanceNgApp(moduleNode){
    // Add a reference to the dom node
    this.ngApp.$element = moduleNode;

    // Add a method to obtain services from this.ngApp
    this.ngApp.getService = (service)=>{
      return this.injector.get(service);
    }
  }

  // Initialize a sublib
  dependsOn( subInit ){
    this.lib.register(function initSubLib(config, settings){
      debug(`Loading dependency for: ${settings.name}`);
      if( typeof subInit === 'function' ){
        // A lib.init method is valid, usually lib.init.bind(lib)
        subInit( config );
      } else {
        // A lib object is also valid
        subInit.init( config );
      }
    });
  }
}

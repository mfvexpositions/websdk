
import objectExtend from 'lodash/object/extend';
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
    this.ngApp    = undefined;
    this.injector = undefined;

    try { this.ngApp = angular.module(settings.name) }
    catch(e){ this.ngApp = angular.module(settings.name, settings.dependencies||[]) }

    // Config is the currenlty running configuration to which any app module/lib would be added
    this.lib.angular = config.angular; // Add the version of angular being used to the library in case someone needs it. REVIEW: This is under review
    
    // REVIEW: Config needs more review so it can interact with multiple frameworks? But this should be flexible enough
    this.config = objectExtend(config, {
      ngApp: this.ngApp
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

  scheduleInit(){
    document.addEventListener('DOMContentLoaded',()=>{

      // Notify about our action
      debug(`Booting ${this.settings.name} at ${this.settings.selector}`, this.settings);

      // Bootstrap the this.ngApp using the selector (should be a tag name)
      var moduleNode = document.getElementsByTagName(this.settings.selector)[0];
      if(!moduleNode) {
        var msg = `Did not find a tag "<${this.settings.selector}>" on which to initiate the app`;
        debug(msg);
        if(console&&console.warn) console.warn(msg);
        return;
      }

      // If we have a moduleNode then bootstrap the app there
      if(this.tmpl) moduleNode.innerHTML = this.tmpl;
      this.lib.angular.bootstrap(moduleNode,[this.settings.name]);

      // Enhance the ngApp
      this.enhanceNgApp(moduleNode);
    })
  }

  // Add properties to the angular.module instance $element, getService, etc...
  enhanceNgApp(moduleNode){
    // Add a reference to the dom node
    this.ngApp.$element = moduleNode;

    // Add a method to obtain services from this.ngApp
    this.ngApp.getService = (service)=>{
      if (!this.injector) {
        this.injector = angular.element(this.ngApp.$element).injector();
      }
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

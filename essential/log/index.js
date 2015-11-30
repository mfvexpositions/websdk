

// REVIEW: Review the logging approach
var
  global = window

  // To turn the logging on, from the console type window["@LOGGING"].enable('*')
  // To turn the logging off, from the console type window["@LOGGING"].disable()
  ,Debug = global['@LOGGGING'] = require('debug')
;

// Export the debugger
export default Debug;
export const debug = Debug('app:debug');
export const log   = Debug('app:log');
export const info  = Debug('app:info');
export const warn  = Debug('app:warn');
export const error = Debug('app:error');

// Set the loggers log method
if(global.console&&global.console.debug) debug.log = Function.bind.call(console.debug, console);
if(global.console&&global.console.log) log.log     = Function.bind.call(console.log, console);
if(global.console&&global.console.info) info.log   = Function.bind.call(console.info, console);
if(global.console&&global.console.warn) warn.log   = Function.bind.call(console.warn, console);
if(global.console&&global.console.error) error.log = Function.bind.call(console.error, console);

// Make the debug function a global if possible, this is to keep simplicity and promote its use other than using console.log
if(typeof global.debug === 'undefined') global.debug = debug;

// https://github.com/webpack/enhanced-resolve/blob/master/lib/createInnerCallback.js
/*
    MIT License http://www.opensource.org/licenses/mit-license.php
    Author Tobias Koppers @sokra
*/
// module.exports = function createInnerCallback(callback, options, message) {
function createInnerCallback(callback, options, message) {
    var log = options.log;
    if(!log) {
        if(options.stack !== callback.stack) {
            function callbackWrapper() {
                return callback.apply(this, arguments);
            }
            callbackWrapper.stack = options.stack;
            callbackWrapper.missing = options.missing;
        }
        return callback;
    }
    function loggingCallbackWrapper() {
        log(message);
        for(var i = 0; i < theLog.length; i++)
            log("  " + theLog[i]);
        return callback.apply(this, arguments);
    }
    var theLog = [];
    loggingCallbackWrapper.log = function writeLog(msg) {
        theLog.push(msg);
    };
    loggingCallbackWrapper.stack = options.stack;
    loggingCallbackWrapper.missing = options.missing;
    return loggingCallbackWrapper;
}


// Based on (slightly modified to allow functions as the possible files in order to dynamically find default files):
//https://github.com/webpack/enhanced-resolve/blob/master/lib/DirectoryDescriptionFilePlugin.js
/*
    MIT License http://www.opensource.org/licenses/mit-license.php
    Author Tobias Koppers @sokra
*/
// var createInnerCallback = require("./createInnerCallback");

function DirectoryDefaultFilePlugin(files) {
    this.files = files;
}
module.exports = DirectoryDefaultFilePlugin;

DirectoryDefaultFilePlugin.prototype.apply = function(resolver) {
    var getFiles = (typeof this.files === 'function') ? this.files : function(){ return this.files };
    resolver.plugin("directory", function(request, callback) {
        var fs = this.fileSystem;
        var topLevelCallback = callback;
        var directory = this.join(request.path, request.request);
        fs.stat(directory, function(err, stat) {
            if(err || !stat) {
                if(callback.log) callback.log(directory + " doesn't exist (directory default file)");
                return callback();
            }
            if(!stat.isDirectory()) {
                if(callback.log) callback.log(directory + " is not a directory (directory default file)");
                return callback();
            }
            this.forEachBail(getFiles(directory, request.query), function(file, callback) {
                this.doResolve("file", {
                    path: directory,
                    query: request.query,
                    request: file
                }, createInnerCallback(function(err, result) {
                    if(!err && result) return callback(result);
                    return callback();
                }, topLevelCallback, "directory default file " + file));
            }.bind(this), function(result) {
                if(!result) return callback();
                return callback(null, result);
            });
        }.bind(this));
    });
};

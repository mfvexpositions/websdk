# Web SDK

The websdk is a library to ease the creation of progressive web apps. It eases the use of multiple frameworks within the same build and overall application. Frameworks like Angular, Polymer and ReactJS.

Features:
- Simple build system (based on webpack):
- Lazy load library definition
- Declerative imports (even for angular)
- Not opinionated in terms of dependency manager (use bower or npm). Should use npm
- Not opinionated in terms of directory structure
- Allows for incremental migration between frameworks

### How to use

Use the [WebSDK Samples](https://github.com/juliostanley/websdk-samples) as a template/recipe to create a project that uses the websdk.

For the most basic usage (build system only);
- Websdk to be a dependency in package.json
- Create a build file that has ```var build = require('websdk/build'); build.run()```. You can modify ```build.conf``` to modify the defaults for webpack conf.
- Run ```node your/new/build/file.js --od=where/to/put/the/bundles```

### Work in progress
This is just the initial version, more to come soon. Many things supported in this release are not available in the sample code

## Things to notice or not obvious in the samples
- Open your console and look at the logs
- Angular is mixed with polymer
- HTML Imports are allowed, and work with webpack notice [demo.js](./samples/src/web/app_modules/demo) and [title-polymer.html](./samples/src/web/app_modules/demo/welcome/title-polymer)
- The build supports chunks by using ```build.config.websdk.lib = {name:'path'}```
- Chunks can be loaded async using ```<ensure import="">content pending</ensure>```
- Paper elements and angular code are bundled
- No link tag blocking rendering (try throttling your connection), the site weights under 2K uncompressed, you prob want to stop the live-server and use a standard HTTP server
- Changes to files take around one second since webpack only needs to do partial rebuilds when watching files
- The build supports source maps and complete minification (even of HTML imports)

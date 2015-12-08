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
```
npm install websdk
```

### Sample code
The code under [./samples](./samples) is how you would write you application, the directory structure is just the suggested directory structure.

### How to test
The simplest way is to run the code under samples.

Clone this repository wihtin a directory named **node_modules/websdk** (any self created directory).
```
npm install
npm run build
npm start
```

### Work in progress
This is just the initial version, more to come soon. Many things supported in this release are not available in the sample code

## Things to notice or not obvious in the samples
- Open your console and look at the logs
- Angular is mixed with polymer
- HTML Imports are allowed, and work with webpack notice [demo.js](./samples/src/web/app_modules/demo) and title-[polymer.html](./samples/src/web/app_modules/demo/welcome/title-polyer)
- The build supports chunks by using ```build.config.websdk.lib = {name:'path'}```
- Chunks can be loaded async using ```<ensure import="">content pending</ensure>```
- Paper elements and angular code are bundled
- No link tag blocking rendering (try throttling your connection), the site weights under 2K uncompressed, you prob want to stop the live-server and use a standard HTTP server
- Changes to files take around one second since webpack only needs to do partial rebuilds when watching files
- The build supports source maps and complete minification (even of HTML imports)

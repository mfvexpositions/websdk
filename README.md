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

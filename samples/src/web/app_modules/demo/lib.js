var settings = require('./settings.yaml');

import _ from 'lodash';
import {AngularLib} from 'websdk/essential/lib';

class Lib extends AngularLib {
	constructor(){
		super();
	}

	// ID Generator
	getId(name) {
		return `${settings.prefix}${name}`;
	}

	// Retrieving settings
	getSettings() {
		return settings;
	}
}

// Export this new library
export default new Lib();

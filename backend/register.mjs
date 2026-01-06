import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

// Register the Babel loader using the new register() API
register('./loader.mjs', pathToFileURL('./'));


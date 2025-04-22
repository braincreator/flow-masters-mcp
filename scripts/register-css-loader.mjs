// CSS loader registration script
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

// Register our CSS loader
register('./scripts/css-loader.mjs', pathToFileURL('./'));

console.log('CSS loader registered successfully');

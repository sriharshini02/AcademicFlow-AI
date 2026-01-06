import { transformSync } from '@babel/core';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const babelConfig = {
  presets: [
    ['@babel/preset-env', {
      targets: { node: 'current' },
      modules: false // Preserve ES modules instead of converting to CommonJS
    }]
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }]
  ]
};

export async function load(url, context, nextLoad) {
  // Only transform .js files that are not in node_modules
  if (url.endsWith('.js') && !url.includes('node_modules')) {
    try {
      const filePath = fileURLToPath(url);
      const source = readFileSync(filePath, 'utf8');
      const transformed = transformSync(source, {
        ...babelConfig,
        filename: filePath,
        sourceType: 'module'
      });
      
      if (transformed && transformed.code) {
        return {
          format: 'module',
          source: transformed.code,
          shortCircuit: true
        };
      }
    } catch (error) {
      // If transformation fails, fall through to default loader
      console.warn(`Babel transformation failed for ${url}:`, error.message);
    }
  }
  
  // Delegate to the next loader in the chain
  return nextLoad(url, context);
}

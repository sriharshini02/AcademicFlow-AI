export default {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current'
      },
      modules: false // Preserve ES modules instead of converting to CommonJS
    }]
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', {
      legacy: true
    }],
    ['@babel/plugin-proposal-class-properties', {
      loose: true
    }]
  ]
};


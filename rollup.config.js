import json from 'rollup-plugin-json'

export default [{
	input: ['src/daemon.js'],
	output: {
    banner: '#!/usr/bin/env node',
		dir: './bin',
		format: 'cjs',
		sourcemap: false
	},
  plugins: [
    json()
  ]
}, {
	input: ['src/index.js'],
	output: {
		file: 'daemon.js',
		format: 'cjs',
		sourcemap: false
	},
  plugins: [
    json()
  ]
}]
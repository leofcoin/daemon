import json from 'rollup-plugin-json'

export default [{
	input: ['src/cli.js'],
	output: {
    banner: '#!/usr/bin/env node',
		dir: './',
		format: 'cjs',
		sourcemap: false
	},
  plugins: [
    json()
  ]
}, {
	input: ['src/daemon.js'],
	output: {
		dir: './',
		format: 'cjs',
		sourcemap: false
	},
  plugins: [
    json()
  ]
}]
const rm = require('rimraf');
const { join } = require('path');
rm.sync(join(__dirname, '../', 'bin/run*'))
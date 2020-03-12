import { version } from './../package.json'
import commands from './commands.js'

const log = console.log

// program
// .version(version)
// .arguments('<cmd> [env]')
// .command('run [options]', 'start daemon')
// .action(function (cmd, env) {
//   console.log(cmd);
//   return console.log();
//   if (commands[cmd]) return log(`${commands[cmd](env)}`)
//   return `${cmd} not found`
// }).parse(process.argv);

const argv = process.argv.slice(2, process.argv.length);

if (argv.length === 0) import('./run.js')
// if (commands[cmd]) return log(`${commands[cmd](env)}`)
// return `${cmd} not found`
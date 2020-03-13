import { spawn, exec } from 'child_process'
import { join } from 'path'
import Storage from 'lfc-storage';
import { readFile, writeFile } from 'fs';
import { promisify } from 'util'
import Koa from 'koa'
import Router from 'koa-router'
import {version} from './../package.json'
import IpfsHttpClient from 'ipfs-http-client'

const read = promisify(readFile)
const write = promisify(writeFile)

globalThis.configStore = new Storage('lfc-config')

const platform = process.platform
globalThis.programExtension = ''

if (platform === 'win32') programExtension = '.exe';

const spawnNode = async (command = ['daemon', '--enable-namesys-pubsub']) => new Promise(async (resolve, reject) => {
  const node = spawn(join(__dirname, `../node_modules/go-ipfs-dep/go-ipfs/ipfs${programExtension}`), [...command], {env: {
    IPFS_PATH: configStore.root
  }})
  node.stdout.on('data', async data => {
    console.log(`${data}`);
    if (data.toString().includes('Run migrations now')) {
      node.stdin.setEncoding('utf-8');
      // node.stdout.pipe(process.stdout);
      node.stdin.write("y\n");
    } else if (data.toString().includes('Daemon is ready')) {
      resolve(node)
    } else if (data.toString().includes('ipfs cat')) {
      resolve(node)
    }
  })
  
  node.stderr.on('data', async data => {
    console.log(`${data}`);
    if (data.toString().includes('no IPFS repo found')) {
      reject('no IPFS repo found')
    }
  })
});

const connectToBootstrap = async () => {
  const ipfs = new IpfsHttpClient('/ip4/127.0.0.1/tcp/5555')
  let config = await read(join(configStore.root, 'config'))
  config = JSON.parse(config.toString())
  for (const addr of config.Bootstrap) {
    await ipfs.swarm.connect(addr)
  }
};

const transformBootstrap = async () => {
  let config = await read(join(configStore.root, 'config'))
  config = JSON.parse(config.toString())
  config.Bootstrap = ['/ip4/45.137.149.26/tcp/4001/ipfs/QmamkpYGT25cCDYzD3JkQq7x9qBtdDWh4gfi8fCopiXXfs']
  await write(join(configStore.root, 'config'), JSON.stringify(config))
};

export default async () => {
  try {    
  if (!globalThis.LeofcoinStorage) globalThis.LeofcoinStorage = require('lfc-storage');
  if (!globalThis.accountStore) globalThis.accountStore = new LeofcoinStorage('lfc-account')
  if (!globalThis.configStore) globalThis.configStore = new LeofcoinStorage('lfc-config')
  const app = new Koa();
  const router = new Router()
  router.get('/api/version/', ctx => {
    ctx.body = version.split('.')[0]
  })
  router.get('/api/config/', async ctx => {      
    
    const account = await accountStore.get()
    
    const config = await configStore.get()
    if (!config.identity) {
      await configStore.put(config)
      config.identity = await generateProfile()
      await accountStore.put({ public: { walletId: config.identity.walletId }});
      await configStore.put(config);
    }
    ctx.body = JSON.stringify(config)
  })
  router.get('/api/account/', async ctx => {      
    const account = await accountStore.get()
    ctx.body = JSON.stringify(account)
  })
  router.get('/', (ctx, next) => {
    ctx.body = 'true'
    next()
  })
  router.get('/ping', (ctx, next) => {
    ctx.body = 'true'
    next()
  })
  app.use(router.routes());
  app.use(router.allowedMethods());

  app.listen(5050);
    await spawnNode()
    await connectToBootstrap()
  } catch (e) {
    if (e === 'no IPFS repo found') {
      await spawnNode(['init'])
      // await transformBootstrap()
      setTimeout(() => {          
        return spawnNode()
      }, 500);
    }
  }
}
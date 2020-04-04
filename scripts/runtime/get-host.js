#! /user/bin/env node
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const net = require('net');
const os = require('os');

const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const exists = promisify(fs.exists);

const input = path.resolve(process.env.SERVER_HOME, 'pipes', 'get-host.pipe');
const output = path.resolve(process.env.SERVER_HOME, 'data', 'get-host', 'host-data.json');

const MAX_RECORD_SIZE = 10000;

let UPDATING = false;
let timeout;

const options = [
  {
    key: '--refresh-timeout=',
    propertyName: 'refreshInterval',
    value: 5000,
    type: Number
  }
]

function parseCommandLineArgs(replaceString) {
  let value = process.argv.find(i => i.startsWith(replaceString.key));
  const key = replaceString.propertyName;

  if(value) {
      value = getFormattedValue(value.replace(replaceString.key, ''), replaceString);
  } else  {
      value = replaceString.value
  }

  return { [key]: value };
}

const reduceArgsToObject = (previous, current) => Object.assign(previous, parseCommandLineArgs(current));

function getFormattedValue(value, replaceString) {
  console.dir({ value, replaceString });

  switch(replaceString.type) {
      case String:
          return value;
      case Boolean:
          return value === 'true'
      case Number:
        return isNaN(value) ? replaceString.value : Number(value);
  }
}

const getOSInfo = () => {
  const [load1, load5, load15] = os.loadavg();

  const cup = os.cpus();

  return {
    timestamp: new Date().toISOString(),
    Memory: {
      total: os.totalmem(),
      used: os.totalmem() - os.freemem(),
      percent: (((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(2),
    },
    CPU: [
      ...os.cpus()
    ],
    System: {
      arch: os.arch(),
      platform: os.platform(),
      version: os.release(),
      type: os.type()
    },
    LoadAvg: { load1, load5, load15 },
    UpTime: (os.uptime() / 3600).toFixed(2),
    User: {
      home: os.homedir(),
      user: os.userInfo()
    }
  }
}

const updateFile = async (data) => {
  console.log(`${new Date().toISOString()} | info | Updating system info`);
  UPDATING = true;
  const newStats = getOSInfo();
  const recordData = { memory: newStats.Memory, load: newStats.LoadAvg, uptime: newStats.upTime, timestamp: newStats.timestamp };
  const systemData = { cpus: newStats.CPU, system: newStats.System };

  const statFileExists = await exists(output);
  const statFile = statFileExists ? await readFile(output, { encoding: 'utf8' }) : '{"historical":[],"host":{}}';

  const jsonFile = JSON.parse(statFile);

  jsonFile.historical.unshift(recordData);
  jsonFile.historical = jsonFile.historical.slice(0, MAX_RECORD_SIZE);

  jsonFile.host = {...systemData};

  const outputData = JSON.stringify(jsonFile, null, 2);
  await writeFile(output, outputData, 'utf8');
  console.log(`${new Date().toISOString()} | info | System info updated`);
  UPDATING = false;
}

const cleanup = () => {
  return stat(input, (err, stat) => {
    if (err) {
      console.log(`${new Date().toISOString()} | info | No leftover pipe found`);
      return createServer(input);
    }

    return fs.unlink(input, (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      console.log(`${new Date().toISOString()} | info | Socket Removed`);
      return createServer(input);
    });
  });
}

const createServer = (path) => {
  net.createServer((stream) => {
    console.log(`${new Date().toISOString()} | info | Application server started at ${socketPath}, in ${this.environment.NODE_ENV} mode`);
    this.socket = stream;
  })
  .listen(socketPath)
  .on('connection', socket => {
    
    socket.on('data', async dataBuffer => {
      const data = dataBuffer.toString();

      console.log(`${new Date().toISOString()} | info | Message Received: ${data}`);

      if (data === 'update stats' && !UPDATING) {
        updateFile()
      }
    });

  })
  .on('close', () => {
    console.log(`${new Date().toISOString()} | info | Client Connection closed`)
  });
}

const main = async () => {
  const configs = options.reduce(reduceArgsToObject, {});
  // cleanup();

  console.dir(configs);
  
  timeout = setInterval(() => updateFile(), configs.refreshInterval);
}

process.on('beforeExit', () => {
  clearTimeout(timeout);
})

main();
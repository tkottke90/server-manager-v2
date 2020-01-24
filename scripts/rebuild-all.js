const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const { promsify } = require('util');

const readDir = promsify(fs.readdir);

async function main() {

  const [node, scriptName, ...args] = process.argv;
  const flags = args.reduce((acc, cur, index, parentArray) => {
    if (/--?[a-zA-Z]+/g.test(cur)) {
      const key = cur.replace('-', '');
      acc[key] = 
    }

    return acc;
  }, {});

}

main();
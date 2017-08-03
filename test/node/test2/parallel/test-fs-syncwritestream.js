'use strict';
const common = require('../common');
const assert = require('assert');
const spawn = require('child_process').spawn;
const stream = require('stream');
const fs = require('../../../../');
const path = require('path');

// require('internal/fs').SyncWriteStream is used as a stdio implementation
// when stdout/stderr point to files.

if (process.argv[2] === 'child') {
  // Note: Calling console.log() is part of this test as it exercises the
  // SyncWriteStream#_write() code path.
  console.log(JSON.stringify([process.stdout, process.stderr].map((stdio) => ({
    instance: stdio instanceof stream.Writable,
    readable: stdio.readable,
    writable: stdio.writable,
  }))));

  return;
}

common.refreshTmpDir();

const filename = path.join(common.tmpDir, 'stdout');
const stdoutFd = fs.openSync(filename, 'w');

const proc = spawn(process.execPath, [__filename, 'child'], {
  stdio: ['inherit', stdoutFd, stdoutFd ]
});

proc.on('close', common.mustCall(() => {
  fs.closeSync(stdoutFd);

  assert.deepStrictEqual(JSON.parse(fs.readFileSync(filename, 'utf8')), [
    { instance: true, readable: false, writable: true },
    { instance: true, readable: false, writable: true }
  ]);
}));

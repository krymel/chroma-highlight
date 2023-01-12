import { CHROMA_VERSION, getDownloadUrlAndSubpathForCurrentPlatform } from './platform';

import fs = require('fs');
import os = require('os');
import path = require('path');
import zlib = require('zlib');
import https = require('https');
import child_process = require('child_process');
import { dirname, join } from 'path';

const toPath = path.join(__dirname, 'bin', 'chroma');

function validateBinaryVersion(...command: string[]): void {
  command.push('--version');
  let stdout: string;
  try {
    command.shift()!
    stdout = child_process.execFileSync(command.shift()!, command, {
      stdio: 'pipe',
    }).toString().trim();
  } catch (err) {
    if (os.platform() === 'darwin' && /_SecTrustEvaluateWithError/.test(err + '')) {
      let os = 'this version of macOS';
      try {
        os = 'macOS ' + child_process.execFileSync('sw_vers', ['-productVersion']).toString().trim();
      } catch {
      }
      throw new Error(`The "chroma-hl" package cannot be installed because ${os} is too outdated.
The Go compiler (which esbuild relies on) no longer supports ${os},
which means the "esbuild" binary executable can't be run. You can either:
  * Update your version of macOS to one that the Go compiler supports
  * Use the "esbuild-wasm" package instead of the "esbuild" package
  * Build esbuild yourself using an older version of the Go compiler
`);
    }
    throw err;
  }
  if (stdout.split('-')[0] !== CHROMA_VERSION) {
    throw new Error(`Expected ${JSON.stringify(CHROMA_VERSION)} but got ${JSON.stringify(stdout)}`);
  } else {
    console.log('The chroma binary has been installed successfully. Version validated.')
  }
}

function fetch(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location)
        return fetch(res.headers.location).then(resolve, reject);
      if (res.statusCode !== 200)
        return reject(new Error(`Server responded with ${res.statusCode}`));
      let chunks: Buffer[] = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

function extractFileFromTarGzip(buffer: Buffer, subpath: string): Buffer {
  try {
    buffer = zlib.unzipSync(buffer);
  } catch (err: any) {
    throw new Error(`Invalid gzip data in archive: ${err && err.message || err}`);
  }
  let str = (i: number, n: number) => String.fromCharCode(...buffer.subarray(i, i + n)).replace(/\0.*$/, '');
  let offset = 0;
  while (offset < buffer.length) {
    let name = str(offset, 100);
    let size = parseInt(str(offset + 124, 12), 8);
    offset += 512;
    if (!isNaN(size)) {
      if (name === subpath) return buffer.subarray(offset, offset + size);
      offset += (size + 511) & ~511;
    }
  }
  throw new Error(`Could not find ${JSON.stringify(subpath)} in archive`);
}

async function downloadDirectlyFromGithub(pkgUrl: string, subpath: string): Promise<void> {
  // If that fails, the user could have npm configured incorrectly or could not
  // have npm installed. Try downloading directly from npm as a last resort.

  const targetBinPath = join(__dirname, 'bin', subpath)

  try {
  fs.mkdirSync(dirname(targetBinPath), { recursive: true })
  } catch(e) {}
  console.error(`[chroma] Trying to download ${JSON.stringify(pkgUrl)}`, targetBinPath);
  try {
    fs.writeFileSync(targetBinPath, extractFileFromTarGzip(await fetch(pkgUrl), subpath));
    fs.chmodSync(targetBinPath, 0o755);
  } catch (e: any) {
    console.error(`[chroma] Failed to download ${JSON.stringify(pkgUrl)}: ${e && e.message || e}`);
    throw e;
  }
}

async function checkAndPreparePackage(): Promise<void> {
  const { url, subpath } = getDownloadUrlAndSubpathForCurrentPlatform();

  try {
      await downloadDirectlyFromGithub(url, subpath);
  } catch (e3: any) {
    throw new Error(`Failed to download chroma binary from "${url}"`);
  }
}

checkAndPreparePackage().then(() => {
  validateBinaryVersion(process.execPath, toPath);
});
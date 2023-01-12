import os = require('os');

export const CHROMA_VERSION: string = "2.4.0";

export const knownWindowsPackages: Record<string, string> = {
  'win32 arm64 LE': `https://github.com/alecthomas/chroma/releases/download/v${CHROMA_VERSION}/chroma-${CHROMA_VERSION}-windows-arm64.tar.gz`,
  'win32 x64 LE': `https://github.com/alecthomas/chroma/releases/download/v${CHROMA_VERSION}/chroma-${CHROMA_VERSION}-windows-amd64.tar.gz`,
};

export const knownUnixlikePackages: Record<string, string> = {
  'darwin arm64 LE': `https://github.com/alecthomas/chroma/releases/download/v${CHROMA_VERSION}/chroma-${CHROMA_VERSION}-darwin-arm64.tar.gz`,
  'darwin x64 LE': `https://github.com/alecthomas/chroma/releases/download/v${CHROMA_VERSION}/chroma-${CHROMA_VERSION}-darwin-amd64.tar.gz`,
  'linux arm64 LE': `https://github.com/alecthomas/chroma/releases/download/v${CHROMA_VERSION}/chroma-${CHROMA_VERSION}-darwin-arm64.tar.gz`,
  'linux x64 LE': `https://github.com/alecthomas/chroma/releases/download/v${CHROMA_VERSION}/chroma-${CHROMA_VERSION}-linux-amd64.tar.gz`,
};

export function getDownloadUrlAndSubpathForCurrentPlatform(): { url: string, subpath: string, platformKey: string } {
  let url: string;
  let subpath: string;
  let platformKey = `${process.platform} ${os.arch()} ${os.endianness()}`;

  if (platformKey in knownWindowsPackages) {
    url = knownWindowsPackages[platformKey];
    subpath = 'chroma.exe';
  }

  else if (platformKey in knownUnixlikePackages) {
    url = knownUnixlikePackages[platformKey];
    subpath = 'chroma';
  }

  else {
    throw new Error(`Unsupported platform: ${platformKey}`);
  }

  return { url, subpath, platformKey };
}

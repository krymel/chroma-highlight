import { execSync } from "child_process"
import { existsSync } from "fs"
import { resolve } from "path"

/** allows to highlight synchronously, see tests */
export const highlight = (input: string, args: string) => {

    const binaryBaseName = process.platform === 'win32' ? 'chroma.exe' : 'chroma'
    const binaryBasePath = resolve(__dirname, 'bin', binaryBaseName)

    if (!existsSync(binaryBasePath)) {
        throw new Error(`chroma binary could not be found in ${binaryBasePath}`)
    }
    return execSync(`${binaryBasePath} ${args || ''}`, { stdio: 'pipe', input }).toString().trim()
}
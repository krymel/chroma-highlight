import { equal, ok } from "assert"
import { readFileSync } from "fs"
import { resolve } from "path"
import { highlight } from "../dist/index.mjs"

ok(typeof highlight === 'function')

console.time('highlighting | invariant ESM')

const result = highlight(`
  93 |         <img src={\`data:image/png;base64,\${props.img}\`}></img>
  94 |         <div class={classes.goo}>index page</div
> 95 |         <style>
     |         ^
  96 |           {props.cssFile}
  97 |         </style>
  98 |         <MDXFun components={{h2: CustomH2}} />
`, `--formatter html --lexer typescript --style monokailight`)

console.timeEnd('highlighting | invariant ESM')

ok(result)
equal(result, readFileSync(resolve('test/result.html'), { encoding: 'utf-8'}))
const assert = require('assert') 
const { highlight } = require("../dist/index.js")
const { readFileSync, writeFileSync } = require("fs")
const { resolve } = require("path")
const { execSync } = require('child_process')

assert(typeof highlight === 'function')

console.time('highlighting | invariant CJS')

const result = highlight(`
  93 |         <img src={\`data:image/png;base64,\${props.img}\`}></img>
  94 |         <div class={classes.goo}>index page</div
> 95 |         <style>
     |         ^
  96 |           {props.cssFile}
  97 |         </style>
  98 |         <MDXFun components={{h2: CustomH2}} />
`, `--formatter html --lexer typescript --style monokailight`)

console.timeEnd('highlighting | invariant CJS')

assert(result)
assert(result === readFileSync(resolve('test/result.html'), { encoding: 'utf-8'}))
# tslint-config-security
[![Build Status](https://secure.travis-ci.org/webschik/tslint-config-security.png?branch=master)](https://travis-ci.org/webschik/tslint-config-security)
[![npm](https://img.shields.io/npm/dm/tslint-config-security.svg)](https://www.npmjs.com/package/tslint-config-security)
[![npm](https://img.shields.io/npm/v/tslint-config-security.svg)](https://www.npmjs.com/package/tslint-config-security)
[![npm](https://img.shields.io/npm/l/tslint-config-security.svg)](https://www.npmjs.com/package/tslint-config-security)

> TSLint security rules

Inspired by [eslint-plugin-security](https://github.com/nodesecurity/eslint-plugin-security)

## How to use
* Install package:
```
npm i --save-dev tslint-config-security
```

* Update your TSLint config:

```json
{
  "extends": ["tslint-config-security"]
}
```


## Rules
All rules start from the prefix `tsr-` (TSLint Security Rule) to prevent name collisions.

#### `tsr-detect-unsafe-regexp`

Locates potentially unsafe regular expressions, which may take a very long time to run, blocking the event loop.

More information: https://blog.liftsecurity.io/2014/11/03/regular-expression-dos-and-node.js

#### `tsr-detect-non-literal-buffer`

Detects variable in [`new Buffer`](https://nodejs.org/api/buffer.html) argument

#### `tsr-detect-buffer-noassert`

Detects calls to [`Buffer`](https://nodejs.org/api/buffer.html) with `noAssert` flag set

From the Node.js API docs: "Setting `noAssert` to true skips validation of the `offset`. This allows the `offset` to be beyond the end of the `Buffer`."

#### `tsr-detect-child-process`

Detects instances of [`child_process`](https://nodejs.org/api/child_process.html) & non-literal [`exec()`](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback)

More information: https://blog.liftsecurity.io/2014/08/19/Avoid-Command-Injection-Node.js

#### `tsr-detect-disable-mustache-escape`

Detects `object.escapeMarkup = false`, which can be used with some template engines to disable escaping of HTML entities. This can lead to Cross-Site Scripting (XSS) vulnerabilities.

More information: https://www.owasp.org/index.php/Cross-site_Scripting_(XSS)

#### `tsr-detect-eval-with-expression`

Detects `eval(variable)` which can allow an attacker to run arbitary code inside your process.

More information: http://security.stackexchange.com/questions/94017/what-are-the-security-issues-with-eval-in-javascript

#### `tsr-detect-no-csrf-before-method-override`

Detects Express `csrf` middleware setup before `method-override` middleware. This can allow `GET` requests (which are not checked by `csrf`) to turn into `POST` requests later.

More information: https://blog.liftsecurity.io/2013/09/07/bypass-connect-csrf-protection-by-abusing

#### `tsr-detect-non-literal-fs-filename`

Detects variable in filename argument of `fs` calls, which might allow an attacker to access anything on your system.

More information: https://www.owasp.org/index.php/Path_Traversal

#### `tsr-detect-non-literal-regexp`

Detects `RegExp(variable)`, which might allow an attacker to DOS your server with a long-running regular expression.

More information: https://blog.liftsecurity.io/2014/11/03/regular-expression-dos-and-node.js

#### `tsr-detect-non-literal-require`

Detects `require(variable)`, which might allow an attacker to load and run arbitrary code, or access arbitrary files on disk.

More information: http://www.bennadel.com/blog/2169-where-does-node-js-and-require-look-for-modules.htm

#### `tsr-detect-possible-timing-attacks`

Detects insecure comparisons (`==`, `!=`, `!==` and `===`), which check input sequentially.

More information: https://snyk.io/blog/node-js-timing-attack-ccc-ctf/

#### `tsr-detect-pseudo-random-bytes`

Detects if `pseudoRandomBytes()` is in use, which might not give you the randomness you need and expect.

More information: http://stackoverflow.com/questions/18130254/randombytes-vs-pseudorandombytes

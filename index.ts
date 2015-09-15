import fs = require('fs');
import path = require('path');
import expand = require('glob-expand');
import os = require('os');

interface Options {
  configPath?: string;
  cwd?: string;
  indent?: number;
}

interface TypeScriptProjectSpec {
  files?: string[];
  filesGlob?: string[];
}

const DEFAULT_CONFIG_DIR: string = '.';
const DEFAULT_CONFIG: string = 'tsconfig.json';
// Match atom-typescript indent level
// https://github.com/TypeStrong/atom-typescript/blob/0071d8466ebfb81b1ff406f0048c56293905b230/dist/main/tsconfig/tsconfig.js#L426
const INDENT: number = 4;

export = function (options:Options):any {
  var cwdPath = options.cwd || process.cwd();
  var configDir = path.resolve(cwdPath, options.configPath || DEFAULT_CONFIG_DIR);
  var projectFile = path.resolve(configDir, DEFAULT_CONFIG);

  var projectSpec:TypeScriptProjectSpec = JSON.parse(fs.readFileSync(projectFile, "utf8"));
  projectSpec.files = projectSpec.files || [];
  projectSpec.filesGlob = projectSpec.filesGlob || [];

  if (projectSpec.filesGlob.length === 0) {
    return;
  }

  projectSpec.files = expand({ filter: 'isFile', cwd: cwdPath }, projectSpec.filesGlob);
  var newProjectFileContents = prettyJSON(projectSpec, INDENT);

  var currentProjectFileContents = fs.readFileSync(projectFile, 'utf8');
  if (newProjectFileContents === currentProjectFileContents) {
    return;
  }

  fs.writeFileSync(projectFile, newProjectFileContents);
};

// Src: https://github.com/TypeStrong/atom-typescript/blob/0071d8466ebfb81b1ff406f0048c56293905b230/lib/main/tsconfig/tsconfig.ts#L680
function prettyJSON(object:any, indent:number):string {
  var cache:any[] = [];
  var value = JSON.stringify(object,
    // fixup circular reference
    function (key, value) {
      if (typeof value === 'object' && value !== null) {
        if (cache.indexOf(value) !== -1) {
          // Circular reference found, discard key
          return;
        }
        // Store value in our collection
        cache.push(value);
      }
      return value;
    },
    indent);
  value = value.split('\n').join(os.EOL) + os.EOL;
  cache = null;
  return value;
}

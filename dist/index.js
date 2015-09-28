var fs = require('fs');
var path = require('path');
var glob = require('glob');
var os = require('os');
var DEFAULT_CONFIG_DIR = '.';
var DEFAULT_CONFIG = 'tsconfig.json';
var INDENT = 4;
function prettyJSON(object, indent) {
    var cache = [];
    var value = JSON.stringify(object, function (key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                return;
            }
            cache.push(value);
        }
        return value;
    }, indent);
    value = value.split('\n').join(os.EOL) + os.EOL;
    cache = null;
    return value;
}
module.exports = function (options) {
    var cwdPath = options.cwd || process.cwd();
    var configDir = path.resolve(cwdPath, options.configPath || DEFAULT_CONFIG_DIR);
    var projectFile = path.resolve(configDir, DEFAULT_CONFIG);
    var projectSpec = JSON.parse(fs.readFileSync(projectFile, "utf8"));
    projectSpec.files = projectSpec.files || [];
    projectSpec.filesGlob = projectSpec.filesGlob || [];
    if (projectSpec.filesGlob.length === 0) {
        return;
    }
    var files = [];
    projectSpec.filesGlob.forEach(function (curGlob) {
        files.push.apply(files, glob.sync(curGlob, { cwd: cwdPath, nodir: true }).sort());
    });
    projectSpec.files = files;
    var newProjectFileContents = prettyJSON(projectSpec, INDENT);
    var currentProjectFileContents = fs.readFileSync(projectFile, 'utf8');
    if (newProjectFileContents === currentProjectFileContents) {
        return;
    }
    fs.writeFileSync(projectFile, newProjectFileContents);
};

var fs = require('fs');
var path = require('path');
var expand = require('glob-expand');
var os = require('os');
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
    var configDir = path.resolve(cwdPath, options.configPath || '.');
    var projectFile = path.resolve(configDir, 'tsconfig.json');
    var indent = options.indent || 2;
    var projectSpec = require(projectFile);
    projectSpec.files = projectSpec.files || [];
    projectSpec.filesGlob = projectSpec.filesGlob || [];
    if (projectSpec.filesGlob.length === 0) {
        return;
    }
    projectSpec.files = expand({ filter: 'isFile', cwd: cwdPath }, projectSpec.filesGlob);
    var newProjectFileContents = prettyJSON(projectSpec, indent);
    var currentProjectFileContents = fs.readFileSync(projectFile, 'utf8');
    if (newProjectFileContents === currentProjectFileContents) {
        return;
    }
    fs.writeFileSync(projectFile, newProjectFileContents);
};

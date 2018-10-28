var merge = require("merge");
var fs = require("fs-extra");
var multigrain = require("multigrain");
var clone = require("clone");
var archiver = require("archiver");
var del = require("del");
var apposite = require("apposite");

var grammarInput = "source/louk.YAML-tmLanguage";
var settingsInput = "source/settings.yaml";
var editors = multigrain.parse(fs.readFileSync("./source/editors.toml", "utf8"), "toml");
var packages = multigrain.parse(fs.readFileSync("./source/packages.yaml", "utf8"), "yaml");
var readmes = fs.readFileSync("./source/READMES.md", "utf8");

module.exports = {
    build: build,
    editors: editors
};

function build(){

    var grammar = parseGrammar(fs.readFileSync(grammarInput, "utf8"));
    var settings = parseSettings(fs.readFileSync(settingsInput, "utf8"));

    for(var editor in editors){
        ensureDir(editor);
        clearDir(editor);
        writeGrammar(editor, grammar);
        writeSettings(editor, settings);
        writePackageInfo(editor);
        writeReadme(editor, readmes);
        copyLicense(editor);
        copyAssets(editor);
        bundle(editor);
    }
}

function clearDir(editor){
    fs.remove("staging/" + editor + "/**/*.*");
}

function ensureDir(editor){
    fs.ensureDirSync("staging/" + editor);
}

function bundle(editor){

    var info = editors[editor];

    if(info.bundle){
        var output = fs.createWriteStream("./staging/" + editor + "/" + info.bundle);
        var archive = archiver("zip", {
          zlib: { level: 1 }
        });
        archive.pipe(output);
        archive.directory('staging/' + editor + "/temp", false);
        archive.finalize();
        del.sync(["staging/" + editor + "/**", "!staging/" + editor, "!staging/" + editor + "/" + info.bundle]);
    }
}

function copyLicense(editor){
    fs.copySync("source/LICENSE", "staging/" + editor + "/LICENSE", {overwrite: true});
}

function copyAssets(editor){
    fs.copySync("source/assets", "staging/" + editor + "/assets", {overwrite: true});
}

function buildPackage(packages, editor){

    var general = clone(packages["*"]);
    var specific = clone(packages[editor]);
    var packageInfo = merge(general, specific);

    return packageInfo;
}

function buildSettings(settings, editor){

    var general = clone(settings["*"]);
    var specific = clone(settings[editor]);

    if(general && specific){
        return merge(general, specific);
    }
    else if(general){
        return general;
    }
    else if (specific){
        return specific;
    }
    else{
        return null;
    }
}

function writeGrammar(editor, grammar){

    var info = editors[editor];
    var dir = "";
    if(info.grammarSubdir){
        dir = "staging/" + editor + "/" + info.grammarSubdir;
    }
    else{
        dir = "staging/" + editor + "/";
    }

    fs.ensureDirSync(dir);

    fs.writeFileSync(dir + info.grammarFile, grammar[info.format]);

}

function writeSettings(editor, settings){

    var info = editors[editor];
    var dir = "";
    if(info.settingsSubdir){
        dir = "staging/" + editor + "/" + info.settingsSubdir;
    }
    else{
        dir = "staging/" + editor + "/";
    }

    if(info.settingsFile){

        var settingsInfo = multigrain[info.format](buildSettings(settings, editor));

        fs.ensureDirSync(dir);
        fs.writeFileSync(dir + info.settingsFile, settingsInfo);
    }
}

function writePackageInfo(editor){

    var distFile = "staging/" + editor + "/package.json";
    var packageInfo = multigrain.json(buildPackage(packages, editor));
    fs.writeFileSync(distFile, packageInfo);

}

function writeReadme(editor, content){

    var distFile  = "staging/" + editor + "/README.md";
    var readme = apposite.render(content, editor);
    fs.writeFileSync(distFile , readme);

}

function parseGrammar(grammar){
    var parsedGrammar = {};
    parsedGrammar.yaml = grammar;
    parsedGrammar.json = multigrain.json(parsedGrammar.yaml, "yaml");
    parsedGrammar.cson = multigrain.cson(parsedGrammar.json, "json");
    parsedGrammar.plist = multigrain.plist(parsedGrammar.json, "json");
    return parsedGrammar;
}

function parseSettings(settings){
    return multigrain.parse(settings, "yaml");
}

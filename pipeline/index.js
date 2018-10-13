var merge = require('merge');
var fs = require('fs');
var multigrain = require('multigrain');

var grammarInput = "source/louk.YAML-tmLanguage";
var settingsInput = "source/settings.yaml";
var editors = multigrain.parse(fs.readFileSync("./source/editors.toml", "utf8"), "toml");
var packages = multigrain.parse(fs.readFileSync("./source/packages.yaml", "utf8"), "yaml");
var readmes = fs.readFileSync("./source/READMES.md", "utf8");

module.exports = {
    build: build,
    editors: editors
};

function buildPackage(packages, editor){

    var general = packages.general;
    var specific = packages[editor];

    var packageInfo = merge(general, specific);

    return packageInfo;
}

function buildReadme(content, editor){

    var input = content;
    var lines = input.split("\n");

    var general = "*";

    var sections = [];
    var section = [];

    var appliesTo = [];

    for(i = 0; i < lines.length; i++){

        var sectionPattern = /^@@@(.*)@@@$/;
        if (lines[i].match(sectionPattern)){
            sections.push([appliesTo,section]);
            section = [];
            var headerMatches = lines[i].match(sectionPattern)[1].split(" ");
            appliesTo = [];
            for(j = 0; j < headerMatches.length; j++){
                if(headerMatches[j] != ""){
                    appliesTo.push(headerMatches[j]);
                }
            }
        }
        else{
            section.push(lines[i]);
        }
    }

    sections.push([appliesTo,section]);

    var scopedSections = [];

    for(i = 0; i < sections.length; i++){
        if(sections[i][0].indexOf(editor) > -1 | sections[i][0].indexOf(general) > -1){
            scopedSections.push(sections[i][1]);
        }
    }

    var output = "";

    for(i = 0; i < scopedSections.length; i++){
        for(j = 0; j < scopedSections[i].length; j++){
            output = output + scopedSections[i][j];
            if(i != (scopedSections.length) && j != (scopedSections.length[i])){
                output = output + "\n";
            }
        }
    }

    return output;
}

function build(){

    var grammar = parseGrammar(fs.readFileSync(grammarInput, "utf8"));
    var settings = parseSettings(fs.readFileSync(settingsInput, "utf8"));

    for(var editor in editors){
      writeGrammar(editor, grammar);
      writeSettings(editor, settings);
      writePackageInfo(editor);
      writeReadme(editor, readmes);
    }

}

function writeGrammar(editor, grammar){

    var info = editors[editor];
    var dir = "staging/" + editor + "/" + info.grammarSubdir;

    ensureDir(dir);

    fs.writeFileSync(dir + info.grammarFile, grammar[info.format]);

}

function writeSettings(editor, settings){

    var info = editors[editor];
    var dir = "staging/" + editor + "/" + info.settingsSubdir;

    if(info.settingsFile){
        ensureDir(dir);
        fs.writeFileSync(dir + info.settingsFile, settings[info.format]);
    }
}

function writePackageInfo(editor){

    var distFile = "staging/" + editor + "/package.json";
    var packageInfo = multigrain.json(buildPackage(packages, editor));
    fs.writeFileSync(distFile, packageInfo);

}

function writeReadme(editor, content){

    var distFile  = "staging/" + editor + "/README.md";
    var readme = buildReadme(content, editor);
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
    var parsedSettings = {};
    parsedSettings.yaml = settings;
    parsedSettings.cson = multigrain.cson(parsedSettings.yaml, "yaml");
    return parsedSettings;
}

function ensureDir(dir){
    if(!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

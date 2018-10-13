var gulp = require('gulp');
var multigrain = require('multigrain');
var fs = require('fs');
var pipeline = require('./pipeline/index.js');

var grammarInput = "source/louk.YAML-tmLanguage";
var settingsInput = "source/settings.yaml";
var editors = multigrain.parse(fs.readFileSync("./source/editors.toml", "utf8"), "toml");
var packages = multigrain.parse(fs.readFileSync("./source/packages.yaml", "utf8"), "yaml");
var readmes = fs.readFileSync("./source/READMES.md", "utf8");

gulp.task('build', function(done) {
    build();
    done();
});

gulp.task("preview", function(done){
    for(var editor in editors){
        gulp.src("staging/" + editor + "/**/*")
            .pipe(gulp.dest(editors[editor].previewDir));
    }
    done();
});

gulp.task("distribute", function(done){
    for(var editor in editors){
        gulp.src("staging/" + editor + "/**/*")
            .pipe(gulp.dest(editors[editor].distDir));
    }
    done();
});

gulp.task('default', gulp.series('build', 'preview', 'distribute'));

gulp.task('watch', function() {
    return gulp.watch('/*', gulp.series('build', 'preview', 'distribute'));
});

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
    var packageInfo = multigrain.json(pipeline.package(packages, editor));
    fs.writeFileSync(distFile, packageInfo);

}

function writeReadme(editor, content){

    var distFile  = "staging/" + editor + "/README.md";
    var readme = pipeline.readme(content, editor);
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

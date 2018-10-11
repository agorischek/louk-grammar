var gulp = require('gulp');
var multigrain = require('multigrain');
var fs = require('fs');
var pipeline = require('./pipeline/index.js');

var input = "src/louk.YAML-tmLanguage";
var editors = multigrain.parse(fs.readFileSync("./src/editors.toml", "utf8"), "toml");
var packages = multigrain.parse(fs.readFileSync("./src/packages.yaml", "utf8"), "yaml");
var readmes = fs.readFileSync("./src/READMES.md", "utf8");

gulp.task('build', function(done) {
    build();
    done();
});

gulp.task('default', gulp.series('build'));

gulp.task('watch', function() {
    return gulp.watch('src/*', gulp.series('build'));
});

function build(){

    var grammar = {};
    grammar.yaml = fs.readFileSync(input, "utf8");

    grammar.json = multigrain.json(grammar.yaml, "yaml");
    grammar.cson = multigrain.cson(grammar.json, "json");
    grammar.plist = multigrain.plist(grammar.json, "json");

    writeGrammar("sublime", grammar);
    writePackageInfo("sublime");
    writeReadme(readmes, "sublime");

    writeGrammar("atom", grammar);
    writePackageInfo("atom");
    writeReadme(readmes, "atom");

}

function writeGrammar(editor, grammar){

    var info = editors[editor];

    fs.writeFileSync(info.distDir + info.grammarSubdir + info.file, grammar[info.format]);
    fs.writeFileSync(info.previewDir + info.grammarSubdir + info.file, grammar[info.format]);

}

function writePackageInfo(editor){

    var distFile = editors[editor].distDir + "package.json";
    var previewFile = editors[editor].previewDir + "package.json";

    var packageInfo = multigrain.json(pipeline.package(packages, editor));

    fs.writeFileSync(distFile, packageInfo);
    fs.writeFileSync(previewFile, packageInfo);
}

function writeReadme(content, editor){

    var distFile  = editors[editor].distDir + "README.md";
    var readme = pipeline.readme(content, editor);

    fs.writeFileSync(distFile , readme);

}

var gulp = require('gulp');
var multigrain = require('multigrain');
var fs = require('fs');
var pipeline = require('./pipeline/index.js');

var input = "source/louk.YAML-tmLanguage";
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

    var grammar = parseGrammar(fs.readFileSync(input, "utf8"));

    for(var editor in editors){
      writeGrammar(editor, grammar);
      writePackageInfo(editor);
      writeReadme(editor, readmes);
    }

}

function writeGrammar(editor, grammar){

    var info = editors[editor];
    fs.writeFileSync("staging/" + editor + "/" + info.grammarSubdir + info.file, grammar[info.format]);

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

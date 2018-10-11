const gulp = require('gulp');
const multigrain = require('multigrain');
const fs = require('fs');
const pipeline = require('./pipeline/index.js')

const input = "src/louk.YAML-tmLanguage"
const editors = multigrain.parse(fs.readFileSync("./src/editors.toml", "utf8"), "toml")
const packages = multigrain.parse(fs.readFileSync("./src/packages.yaml", "utf8"), "yaml")
const readmes = fs.readFileSync("./src/READMES.md", "utf8")

gulp.task('build', function(done) {
    build();
    done();
});

gulp.task('watch', ['default'], function(done) {
    watch();
    done();
});

gulp.task('default', function(done){
    build();
    done();
})

function build(){

    const grammar = {}
    grammar.yaml = fs.readFileSync(input, "utf8");

    grammar.json = multigrain.json(grammar.yaml, "yaml");
    grammar.cson = multigrain.cson(grammar.json, "json");
    grammar.plist = multigrain.plist(grammar.json, "json");

    writeGrammar("sublime", grammar)
    writePackageInfo("sublime")
    writeReadme(readmes, "sublime")

    writeGrammar("atom", grammar)
    writePackageInfo("atom")
    writeReadme(readmes, "atom")

}

function watch(){
    return gulp.watch('src/*', ['default']);
}

function writeGrammar(editor, grammar){

    const info = editors[editor]

    fs.writeFileSync(info.distDir + info.grammarSubdir + info.file, grammar[info.format])
    fs.writeFileSync(info.previewDir + info.grammarSubdir + info.file, grammar[info.format])

}

function writePackageInfo(editor){

    const distFile = editors[editor].distDir + "package.json"
    const previewFile = editors[editor].previewDir + "package.json"

    const packageInfo = multigrain.json(pipeline.package(packages, editor))

    fs.writeFileSync(distFile, packageInfo)
    fs.writeFileSync(previewFile, packageInfo)
}

function writeReadme(content, editor){

    const distFile  = editors[editor].distDir + "README.md"
    const readme = pipeline.readme(content, editor)

    fs.writeFileSync(distFile , readme)

}

const gulp = require('gulp');
const yaml = require('yamljs');
const cson = require('cson');
const plist = require('plist');
const fs = require('fs');

const input = "src/louk.YAML-tmLanguage"
const editors = yaml.parse(fs.readFileSync("editors.yaml", "utf8"))

function writeOutput(editor, grammar){

    const info = editors[editor]

    fs.writeFileSync(info.distDir + info.grammarSubdir + info.file, grammar[info.format])
    fs.writeFileSync(info.previewDir + info.grammarSubdir + info.file, grammar[info.format])

}

function build(){

    const grammar = {}
    grammar.yaml = fs.readFileSync(input, "utf8");

    grammar.json = yaml.parse(grammar.yaml);
    grammar.cson = cson.createCSONString(grammar.json);
    grammar.plist = plist.build(grammar.json);

    writeOutput("sublime", grammar)
    writeOutput("atom", grammar)

}

function watch(){
    return gulp.watch('src/*', ['default']);
}

gulp.task('build', function() {
    build();
});

gulp.task('watch', ['default'], function() {
    watch();
});

gulp.task('default', function(){
    build();
})

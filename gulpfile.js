const gulp = require('gulp');
const yaml = require('yamljs');
const cson = require('cson');
const plist = require('plist');
const fs = require('fs');
const merge = require('merge');

const input = "src/louk.YAML-tmLanguage"
const editors = yaml.parse(fs.readFileSync("editors.yaml", "utf8"))
const packages = yaml.parse(fs.readFileSync("./src/packages.yaml", "utf8"))
const readmes = fs.readFileSync("./src/READMES.md", "utf8")

gulp.task('build', function() {
    build();
});

gulp.task('watch', ['default'], function() {
    watch();
});

gulp.task('default', function(){
    build();
})

function writeOutput(editor, grammar){

    const info = editors[editor]

    fs.writeFileSync(info.distDir + info.grammarSubdir + info.file, grammar[info.format])
    fs.writeFileSync(info.previewDir + info.grammarSubdir + info.file, grammar[info.format])

}

function writePackageInfo(editor){

    const info = editors[editor]

    const general = packages.general
    const specific = packages[editor]

    const package = merge(general, specific)

    fs.writeFileSync(info.distDir + "package.json", JSON.stringify(package))
    fs.writeFileSync(info.previewDir + "package.json", JSON.stringify(package))
}

function build(){

    const grammar = {}
    grammar.yaml = fs.readFileSync(input, "utf8");

    grammar.json = yaml.parse(grammar.yaml);
    grammar.cson = cson.createCSONString(grammar.json);
    grammar.plist = plist.build(grammar.json);

    writeOutput("sublime", grammar)
    writePackageInfo("sublime")
    writeReadme(readmes, "sublime")

    writeOutput("atom", grammar)
    writePackageInfo("atom")
    writeReadme(readmes, "atom")

}

function watch(){
    return gulp.watch('src/*', ['default']);
}

function writeReadme(content, editor){

    const info = editors[editor]

    const input = content
    const lines = input.split("\n")

    const general = "*"

    var sections = []

    var section = []
    var appliesTo = []

    for(i = 0; i < lines.length; i++){

        const sectionPattern = /^@@@(.*)@@@$/
        if (lines[i].match(sectionPattern)){
            sections.push([appliesTo,section])
            var section = []
            var headerMatches = lines[i].match(sectionPattern)[1].split(" ")
            var appliesTo = []
            for(j = 0; j < headerMatches.length; j++){
                if(headerMatches[j] != ""){
                    appliesTo.push(headerMatches[j])
                }
            }
        }
        else{
            section.push(lines[i])
        }
    }

    sections.push([appliesTo,section])

    var scopedSections = []

    for(i = 0; i < sections.length; i++){
        if(sections[i][0].indexOf(editor) > -1 | sections[i][0].indexOf(general) > -1){
            scopedSections.push(sections[i][1])
        }
    }

    var output = ""

    for(i = 0; i < scopedSections.length; i++){
        for(j = 0; j < scopedSections[i].length; j++){
            output = output + scopedSections[i][j]
            if(i != (scopedSections.length - 1) && j != (scopedSections.length[i] - 1)){
                output = output + "\n"
            }
        }
    }

    fs.writeFileSync(info.distDir + "README.md", output)
}

const gulp = require('gulp');
const YAML = require('yamljs');
const plist = require('simple-plist');

const input = "src/louk.YAML-tmLanguage"
const outputFile = "louk.tmLanguage"
const distOutput = {
    sublime: "dist/sublime/" + outputFile
}
const previewOutput = "../../Library/Application Support/Sublime Text 3/Packages/User/" + outputFile

function build(){
    const grammar = YAML.load(input);
    plist.writeFileSync(distOutput.sublime, grammar);
    plist.writeFileSync(previewOutput, grammar);
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

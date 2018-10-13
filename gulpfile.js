var gulp = require('gulp');
var pipeline = require('./pipeline/index.js');
var editors = pipeline.editors;

gulp.task('build', function(done) {
    pipeline.build();
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

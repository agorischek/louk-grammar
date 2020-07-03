var gulp = require("gulp");
var mocha = require("gulp-mocha");
var generator = require("./generator/index.js");
var editors = generator.editors;

gulp.task("build", function (done) {
  generator.build();
  done();
});

gulp.task("preview", function (done) {
  for (var editor in editors) {
    gulp
      .src("staging/" + editor + "/**/*")
      .pipe(gulp.dest(editors[editor].previewDir));
  }
  done();
});

gulp.task("distribute", function (done) {
  for (var editor in editors) {
    gulp
      .src("staging/" + editor + "/**/*")
      .pipe(gulp.dest(editors[editor].distDir));
  }
  done();
});

gulp.task("test", function () {
  return gulp.src("test/**/*.js", { read: false }).pipe(mocha());
});

gulp.task(
  "default",
  gulp.series("build", gulp.parallel("preview", "distribute"), "test")
);

gulp.task("watch", function () {
  return gulp.watch("/source/*", gulp.series("build", "preview", "distribute"));
});

const gulp = require('gulp');
const typescript = require('gulp-typescript');
const exec = require('child_process').exec;
const del = require('del');

gulp.task('clean', () => {
     return del(['./build']);
});

gulp.task('typescript', () => {
     return gulp.src(['./server.ts'], { base: './' })
          .pipe(typescript({ noImplicitAny: false }))
          .pipe(gulp.dest('./build'));
});

gulp.task('run', ['typescript'], (callback) => {
     exec('.\\node_modules\\.bin\\phantomjs .\\build\\server.js 1000', (error, stdout, stderr) => {
          callback(error);
     });
});

gulp.task('default', ['run']);
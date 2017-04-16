var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    jsFiles = 'src/*.js',
    dist = 'dist';


gulp.task('compress', function () {
    return gulp.src(jsFiles)
        .pipe(concat('carolina.min.js'))
        .pipe(uglify()).on('error', function (e) {
            console.log(e);
        })
        .pipe(gulp.dest(dist))
});

gulp.task('default', ['compress']);
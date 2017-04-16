var gulp = require('gulp'),
    concat = require('gulp-concat'),
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify'),
    jsFiles = 'src/*.js',
    dist = 'dist';


gulp.task('compress', function () {
    return gulp.src(jsFiles)
        .pipe(concat('carolina.min.js'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(uglify()).on('error', function (e) {
            console.log(e);
        })
        .pipe(gulp.dest(dist))
});

gulp.task('deploy', ['compress']);
var gulp = require('gulp');
var del = require('del');
var cache = require('gulp-cache');
var notify = require('gulp-notify');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var imagemin = require('gulp-imagemin');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');


gulp.task('removedist', function () { return del.sync('public'); });

gulp.task('imagemin', function () {
	return gulp.src('src/img/**/*')
		.pipe(cache(imagemin()))
		.pipe(gulp.dest('public/img'));
});

gulp.task('sass', function () {
	return gulp.src([
		'src/sass/**/*.scss',
		'src/libs/bootstrap-grid/bootstrap-grid.css',
	])
		.pipe(sass({ outputStyle: 'expand' }).on('error', notify.onError()))
		.pipe(rename({ suffix: '.min', prefix: '' }))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(cleanCSS())
		.pipe(gulp.dest('public/css'))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('common-js', function () {
	return gulp.src([
		'src/js/common.js',
		'src/js/main.js',
	])
        .pipe(concat('common.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('src/js'));
});

gulp.task('js', ['common-js'], function () {
	return gulp.src([
		'src/libs/jquery/dist/jquery.min.js',
		'src/js/common.min.js', // should be in the end
	])
        .pipe(concat('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/js'))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task('build', ['removedist', 'imagemin', 'sass', 'js'], function () {
	gulp.src([
		'src/fonts/**/*',
	]).pipe(gulp.dest('public/fonts'));

});

gulp.task('clearcache', function () { return cache.clearAll(); });

gulp.task('watch', ['sass', 'js', 'browser-sync'], function () {
	gulp.watch('src/sass/**/*.scss', ['sass']);
	gulp.watch(['src/libs/**/*.js', 'src/js/common.js'], ['js']);
	// gulp.watch('src/*.html', browserSync.reload);
});

gulp.task('default', ['watch']);

gulp.task('browser-sync', function () {
	browserSync({
		server: {
			baseDir: 'src',
		},
		notify: false,
        // tunnel: true,
        // tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
	});
});

const fs = require('fs');
const gulp = require('gulp');
const del = require('del');
const cache = require('gulp-cache');
const notify = require('gulp-notify');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const browserSync = require('browser-sync');
const sass = require('gulp-sass');
const imagemin = require('gulp-imagemin');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

const PUBLIC_DIR = './public';
const SRC_DIR = './src';

gulp.task('removedist', function () {
	try {
		fs.statSync(PUBLIC_DIR);
	} catch (e) {
		console.log(`WARN: ${PUBLIC_DIR} doesn't exist`);
		fs.mkdirSync(PUBLIC_DIR);
	}

	return del.sync('public');
});

gulp.task('imagemin', function () {
	return gulp.src(`${SRC_DIR}/img/**/*`)
		.pipe(cache(imagemin()))
		.pipe(gulp.dest(`${PUBLIC_DIR}/img`));
});

gulp.task('sass', function () {
	return gulp.src([
		`${SRC_DIR}/sass/**/*.scss`,
		`${SRC_DIR}/libs/bootstrap-grid/bootstrap-grid.css`,
	])
		.pipe(sass({ outputStyle: 'expand' }).on('error', notify.onError()))
		.pipe(rename({ suffix: '.min', prefix: '' }))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(cleanCSS())
		.pipe(gulp.dest(`${PUBLIC_DIR}/css`))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('common-js', function () {
	return gulp.src([
		`${SRC_DIR}/js/common.js`,
		`${SRC_DIR}/js/main.js`,
	])
        .pipe(concat('common.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(`${SRC_DIR}/js`));
});

gulp.task('js', ['common-js'], function () {
	return gulp.src([
		`${SRC_DIR}/libs/jquery/dist/jquery.min.js`,
		`${SRC_DIR}/js/common.min.js`, // should be in the end
	])
        .pipe(concat('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(`${PUBLIC_DIR}/js`))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task('build', ['removedist', 'imagemin', 'sass', 'js'], function () {
	gulp.src([
		`${SRC_DIR}/fonts/**/*`,
	]).pipe(gulp.dest('public/fonts'));

});

gulp.task('clearcache', function () { return cache.clearAll(); });

gulp.task('watch', ['sass', 'js', 'browser-sync'], function () {
	gulp.watch(`${SRC_DIR}/sass/**/*.scss`, ['sass']);
	gulp.watch([`${SRC_DIR}/libs/**/*.js`, `${SRC_DIR}/js/common.js`], ['js']);
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
        // tunnel: "projectmane", // Demonstration page: http://projectmane.localtunnel.me
	});
});

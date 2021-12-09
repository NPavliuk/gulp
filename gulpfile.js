let project_folder = 'dist';
let source_folder = 'src';

let path = {
	build: {
		html: project_folder + '/',
		css: project_folder + '/css/',
		js: project_folder + '/js/',
		img: project_folder + '/img/',
		fonts: project_folder + '/fonts/',
		assets: project_folder + '/assets/',
	},
	src: {
		html: [source_folder + '/*.html', '!' + source_folder + '/_*.html'],
		css: source_folder + '/scss/style.scss',
		js: source_folder + '/js/script.js',
		img: source_folder + '/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}',
		fonts: source_folder + '/fonts/*.{woff,woff2}',
		assets: source_folder + '/assets/**',
	},
	watch: {
		html: source_folder + '/**/*.html',
		css: source_folder + '/scss/**/*.scss',
		js: source_folder + '/js/**/*.js',
		img: source_folder + '/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}',
		assets: source_folder + '/assets/**',
	},
	clean: './' + project_folder + '/'
}

let {src, dest } = require('gulp'),
	gulp = require('gulp'),
	browsersync = require('browser-sync').create(),
	fileinclude = require('gulp-file-include'),
	del = require('del'),
	scss = require('gulp-sass')(require('sass')),
	autoprefixer = require('gulp-autoprefixer'),
	group_media = require('gulp-group-css-media-queries'),
	clean_css = require('gulp-clean-css'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify-es').default,
	babel = require('gulp-babel'),
	imagemin = require('gulp-imagemin'),
	webp = require('gulp-webp'),
	ttf2woff = require('gulp-ttf2woff'),
	ttf2woff2 = require('gulp-ttf2woff2');

function browserSync() {
	browsersync.init({
		server: {
			baseDir: './' + project_folder + '/'
		},
		port: 3000,
		notify: false,
	})
}

function html () {
	return src(path.src.html)
		.pipe(fileinclude())
		.pipe(dest(path.build.html))
		.pipe(browsersync.stream())
}

function css () {
	return src(path.src.css)
		.pipe(
			scss({
				outputStyle: 'expanded'
			})
		)
		.pipe(group_media())
		.pipe(
			autoprefixer({
				overrideBrowserslist: ['last 2 versions'],
				cascade: true
			})
		)
		.pipe(dest(path.build.css))
		.pipe(clean_css())
		.pipe(
			rename({
				extname: '.min.css'
			})
		)
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream())
}

function js () {
	return src(path.src.js)
		.pipe(fileinclude())
		.pipe(dest(path.build.js))
		.pipe(
			babel({
            	presets: ['@babel/env']
        	})
		)
		.pipe(uglify())
		.pipe(
			rename({
				extname: '.min.js'
			})
		)
		.pipe(dest(path.build.js))
		.pipe(browsersync.stream())
}

function images () {
	return src(path.src.img)
		.pipe(
			webp({
				quality: 70,
			})
		)
		.pipe(dest(path.build.img)) // Upload webp images
		.pipe(src(path.src.img)) 
		.pipe(
			imagemin({
				progressive: true,
				svgoPlugins: [{removeViewBox: false}],
				interlaced: true,
				optimizationLevel: 3 
			})
		)
		.pipe(dest(path.build.img)) // Upload minified images
		.pipe(browsersync.stream())
}

function fonts () {
	return src(path.src.fonts)
		.pipe(dest(path.build.fonts))
}

function assets () {
	return src(path.src.assets)
		.pipe(dest(path.build.assets))
		.pipe(browsersync.stream())
}

function clean () {
	return del(path.clean);
}

function watchFiles () {
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.css], css);
	gulp.watch([path.watch.js], js);
	gulp.watch([path.watch.img], images);
	gulp.watch([path.watch.assets], assets);
}

// use 'gulp ff' for formatting .ttf fonts to .woff and .woff2
gulp.task('ff', function () {
	let source_folder_fonts = source_folder + '/fonts/';
	return src([source_folder_fonts + '*.ttf'])
		.pipe(ttf2woff())
		.pipe(dest(source_folder_fonts))
		.pipe(src([source_folder_fonts + '*.ttf']))
		.pipe(ttf2woff2())
		.pipe(dest(source_folder_fonts))
})

let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts, assets));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.assets = assets;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;



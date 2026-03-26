const { src, dest, series, parallel, watch } = require('gulp');
const fs = require('fs');
const browserSync = require('browser-sync').create();
const del = require('del');
const gulpif = require('gulp-if');
const argv = require('yargs/yargs')(process.argv.slice(2)).parseSync();
const twig = require('gulp-twig');
const htmlbeautify = require('gulp-html-beautify');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const rename = require('gulp-rename');
const packageJSON = require('./package.json');
const dataJSON = require('./data.json');


var source = {
	twig: [
		'src/twig/*.twig'
	],
	templates: '*.html'
};


function compileTwig() {
	return src(source.twig)
		.pipe(twig({
			data: dataJSON
		}))
		.pipe(rename({
			extname: '.html'
		}))
		.pipe(dest('./'))
		.pipe(browserSync.stream());
}


function prettyhtml() {
	return src(source.templates)
		.pipe(htmlbeautify({
			"indent_size": 1,
			"indent_char": "	",
			"preserve_newlines": false
		}))
		.pipe(dest('./'));
}


function compileSass() {
	return src(packageJSON.css)
		.pipe(sass({
			silenceDeprecations: ['legacy-js-api']
		}).on('error', sass.logError))
		.pipe(postcss([
			require('autoprefixer')()
		]))
		.pipe(gulpif(argv.production, postcss([
			require('postcss-pxtorem')({
				propList: [
					'font-size',
					'line-height',
					'letter-spacing',
					'*margin*',
					'*padding*',
					'*width*',
					'*height*'
				],
				replace: false,
				rootValue: 16
			})
		])))
		.pipe(gulpif(argv.production, postcss([cssnano()])))
		.pipe(dest('css'))
		.pipe(browserSync.stream());
}


function clean(done) {
	del('css');
	del('favicons');
	del('images');
	del('js');
	del('*.html');
	done();
}


function runBrowserSync(done) {
	browserSync.init({
		logPrefix: packageJSON.name,
		notify: {
			styles: {
				top: 'auto',
				bottom: '0',
				padding: '4px',
				fontSize: '12px',
				borderBottomLeftRadius: '0'
			}
		},
		open: false,
		server: './',
		startPath: 'index.html',
		ui: false
	});

	done();
}


function reloadSystem(done) {
	browserSync.reload();

	done();
}


function watchFileSystem(done) {
	watch('package.json', series(
		compileTwig,
		reloadSystem
	));

	watch([
		'src/twig/**/*.twig'
	], series(
		compileTwig
	));

	watch('src/css/**/**', series(
		compileSass
	));

	done();
}


exports.compileSass = compileSass;
exports.compileTwig = compileTwig;
exports.clean = clean;


exports.default = series(
	compileSass,
	compileTwig,
	watchFileSystem,
	runBrowserSync
);


exports.build = parallel(
	compileSass,
	series(
		compileTwig,
		prettyhtml,
	)
);


exports.dev = parallel(
	watchFileSystem,
	runBrowserSync
);

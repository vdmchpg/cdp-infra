/*eslint-disable */
const gulp = require('gulp');
const del = require('del');
const gulpif = require('gulp-if');
const imagemin = require('gulp-imagemin');
const spritesmith = require('gulp.spritesmith');
const htmlreplace = require('gulp-html-replace');
const bower = require('gulp-bower');
const eslint = require('gulp-eslint');
const gulpStylelint = require('gulp-stylelint');
const wpConfig = require('./webpack.config');
const webpack = require("webpack");
const WebpackDevServer = require('webpack-dev-server');

let argv = require('minimist')(process.argv.slice(2), {
    string: 'env',
    default: {env: process.env.NODE_ENV || 'development'}
});

let compiler;

const conf = {
    less: 'src/less/*.less',
    js: 'src/js/**/*.js',
    images: ['src/images/**/*.{png,svg}', '!src/images/icons/**'],
    icons: 'src/images/icons/*.png',
    html: 'src/*.html',
    sprite: {
        imgName: 'images/build/sprite.png',
        cssName: 'less/build/sprite.less',
        imgPath: '../../images/build/sprite.png'
    },
    build: {
        tmpFolders: '**/build',
        folder: 'build/',
        css: 'build/css',
        images: 'build/images',
        js: 'build/js',
        html: 'build/'
    }
};

gulp.task('bower', function () {
    return bower()
        .pipe(gulp.dest('bower_components'));
});


gulp.task('images', ['clean', 'bower', 'sprite'], function () {
    return gulp.src(conf.images)
        .pipe(gulpif(argv.env === 'production', imagemin()))
        .pipe(gulp.dest(conf.build.images))
});

gulp.task('sprite', ['clean'], function () {
    return gulp.src(conf.icons)
        .pipe(spritesmith(conf.sprite))
        .pipe(gulp.dest('src/'));
});

gulp.task('html', ['clean'], function () {
    return gulp.src(conf.html)
        .pipe(gulpif(argv.env === 'production',
            htmlreplace({
                'js': ['../main.js'],
                'logo': {
                    src: '../images/logo_gray-blue_80px.svg',
                    tpl: '<img src="%s" alt="Epam logo"/>'
                },
                'css': '../styles.css'
            }),
            htmlreplace({
                'js': ['../main.js', 'http://localhost:3001/webpack-dev-server.js'],
                'logo': {
                    src: '../images/logo_gray-blue_80px.svg',
                    tpl: '<img src="%s" alt="Epam logo"/>'
                },
                'css': '../styles.css'
            })
        ))
        .pipe(gulp.dest(conf.build.html));
});


gulp.task('bundle', ['bower'], function () {
    const config = wpConfig;
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
    compiler = webpack(config, function (err, stats) {
    });
});

gulp.task('bundle:prod', ['bower'], function () {
    const config = wpConfig;
    config.devtool = 'cheap-module-source-map';
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
        beautify: false,
        comments: false,
        compress: {
            sequences: true,
            booleans: true,
            loops: true,
            unused: true,
            warnings: false,
            drop_console: true,
            unsafe: true
        }
    }));
    config.plugins.push(new webpack.optimize.DedupePlugin());
    compiler = webpack(config, function (err, stats) {
    });
});


gulp.task('clean', function () {
    return del([conf.build.folder, conf.build.tmpFolders]);
});

gulp.task('build', ['images', 'html', 'bundle']);

gulp.task('build:prod', ['images', 'html', 'bundle:prod']);

gulp.task('lint:scripts', () => {
    return gulp.src(['./src/js/**.js','!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .pipe(eslint.result(result => {
            // Called for each ESLint result.
            console.log(`ESLint result: ${result.filePath}`);
            console.log(`# Messages: ${result.messages.length}`);
            console.log(`# Warnings: ${result.warningCount}`);
            console.log(`# Errors: ${result.errorCount}`);
        }));
});

gulp.task('lint:styles', () => {
    return gulp
        .src(['./src/less/**.less','!./less/build/'])
        .pipe(gulpStylelint({
            reporters: [
                {formatter: 'string', console: true}
            ]
        }));
});

gulp.task('lint', ['lint:styles', 'lint:scripts']);

gulp.task('watch', ['build'], function () {
    let server = new WebpackDevServer(compiler, {
        contentBase: 'build',
        hot: true,
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        },
    });

    server.listen(3001, "localhost", function () {
        console.log('Server is running on http://localhost:3001/');
    });
});

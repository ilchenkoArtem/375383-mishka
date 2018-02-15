"use strict";

var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var rename = require("gulp-rename");
var svgstore = require('gulp-svgstore');
var svgmin = require('gulp-svgmin');
var cheerio = require('gulp-cheerio');
var csso = require('gulp-csso');
var imagemin = require('gulp-imagemin');
var del = require('del');
var run = require('run-sequence');
var webp = require('gulp-webp');

gulp.task("style", function () {
    gulp.src("source/less/style.less")
        .pipe(plumber())
        .pipe(less())
        .pipe(postcss([
      autoprefixer()
    ]))
        .pipe(gulp.dest("source/css"))
        .pipe(server.stream());
});

gulp.task("serve", ["style"], function () {
    server.init({
        server: "source/",
        notify: false,
        open: true,
        cors: true,
        ui: false
    });

    gulp.watch("source/less/**/*.less", ["style"]);
    gulp.watch("source/*.html").on("change", server.reload);
});


gulp.task("copy", function () {
    return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**",
    "source/*.html"
 ], {
            base: "source"
        })
        .pipe(gulp.dest("build"));
});

gulp.task("svgmin", function () {
    return gulp.src("source/img/**/*.svg")
        .pipe(svgmin())
        .pipe(gulp.dest("build/img"));
})

gulp.task("sprite", function () {
    return gulp.src("source/img/changingSvg/*.svg")
        .pipe(svgmin({
            plugins: [{
                moveElemsAttrsToGroup: true
         }]
        }))
        .pipe(svgstore({
            inlineSvg: true
        }))
        .pipe(rename("sprite.svg"))
        .pipe(gulp.dest("source/img"));
});

gulp.task("ccsmin", function () {
    return gulp.src("build/css/style.css")
        .pipe(csso())
        .pipe(rename("style-min.css"))
        .pipe(gulp.dest("build/css"));
});

gulp.task("imgmin", function () {
    return gulp.src("build/img/*.{png,jpg,svg}")
        .pipe(imagemin([
            imagemin.optipng({
                optimizationLevel: 3
            }),
            imagemin.jpegtran({
                progressive: true
            }),
            imagemin.svgo()
            ]))
        .pipe(gulp.dest("build/img"));
});

gulp.task("webp", function () {
    return gulp.src("source/img/content/*.{png,jpg}")
        .pipe(webp({
            quality: 90
        }))
        .pipe(gulp.dest("source/img/content"));
});

gulp.task("clean", function () {
    return del("build");
});

gulp.task("dc", function (done) {
    run("clean", "copy", done);
});

gulp.task("build", function (done) {
    run("dc", "style", "imgmin", "webp", "sprite", done);
});

/**
 * OneUI Suggested Gulpfile
 *
 * Usage: 
 *    gulp 
 *      Default task for local development. 
 *      Builds styles and scripts, caches templates,
 *      and starts a connect server with watches.
 */
var gulp          = require('gulp'),
  del           = require('del'),
  sass          = require('gulp-sass'),
  bump          = require('gulp-bump'),
  tag           = require('gulp-tag-version'),
  filter        = require('gulp-filter'),            
  karma         = require('gulp-karma'),   
  uglify        = require('gulp-uglify'),
  connect       = require('gulp-connect'),    
  concat        = require('gulp-concat'),
 
  templateCache = require('gulp-angular-templatecache'),   
  proxy 	    = require('proxy-middleware'),
  url 			= require('url'),
  runSequence   = require('run-sequence'),
  minifyimage   = require('gulp-image'),
  flatten 		= require('gulp-flatten'),
  deploy 		= require('gulp-gh-pages');	

var config = {
	name: 'govtIDApp',
	sources: {
	  scripts: [
	    'bower_components/angular/angular.min.js',
	    'bower_components/angular-ui-router/release/angular-ui-router.min.js',
	    'bower_components/angular-animate/angular-animate.min.js',
	    'bower_components/angular-cookies/angular-cookies.min.js',	    	    
	    'bower_components/angular-sanitize/angular-sanitize.min.js',
	    'bower_components/angular-touch/angular-touch.min.js',	 	    
	    'bower_components/angular-translate/angular-translate.min.js',
	    'bower_components/jquery/dist/jquery.min.js',
	    //'bower_components/ngprogress/build/ngprogress.js',
	    'bower_components/angular-translate-storage-local/angular-translate-storage-local.min.js',
	    'bower_components/angular-translate-storage-cookie/angular-translate-storage-cookie.min.js',
	    'bower_components/angular-translate-loader-partial/angular-translate-loader-partial.min.js',
	    'bower_components/angular-translate-loader-url/angular-translate-loader-url.min.js',
	    //'bower_components/oneui-*/dist/oneui-*min.js',
	    'app/js/utilities/jquery-1.11.1.js',
	    'app/js/utilities/ngprogress.js',
	    'app/js/utilities/cookie.js',
	    'app/js/utilities/hammer.js',
	    'app/js/utilities/hasStorage.js',
	    'app/js/utilities/jquery.browser.js',	
	    'app/js/utilities/hoverIntent.js',
	  	'app/js/utilities/footerHelper.js',
	  	'app/app.module.js',
	  	'app/app.config.js',
	  	'app/app.routes.js',
	  	'app/app.directive.js',
	  	'app/js/*/scripts/*.service.js',
	  	'app/js/*/scripts/*.controller.js'

	  	  		  		  	
	  ],
	  style: [
	          'app/scss/app.scss'
	  ],	 
	  fonts: [
	  		'bower_components/oneui-core-style/dist/fonts/*',
	  		'bower_components/oneui-icons/dist/fonts/*'
	  	],
	  images: [
	  		'app/images/**/*'
	  	],	  
	  templates: [
	         'app/js/*/partials/*.html'
	    ],
	  rootHtml: [
              'app/*.html'    
	    ],
	  favicon: [
			  'app/images/favicon.ico'
	    ]	
	}
};

gulp.task('deploy', function () {
  return gulp.src("./app/**/*")
    .pipe(deploy())
});



gulp.task('connect', function() {
 return connect.server({
      root: "app/build",    
      livereload: true,
      port: 5050,
      middleware: function(connect, o) {
        	return [ (function() {
  					// var options = url.parse('http://laburnum:11400/upf-ops-dashboard-services-web');
  					var options = url.parse('http://docverif-dev.kdc.capitalone.com/document-identification-web');
  					options.route = '/document-identification-web';
  					options.changeOrigin = true;
  					return proxy(options);
  					})()
  				];
  			}
   });
});



/*gulp.task('connect', function() {
    connect.server({
        root: ['./app'],
        middleware: function(connect, opt) {
            return [
                proxy('/api', {
                    target: 'http://localhost:3000',
                    changeOrigin:true
                })
            ]
        }

    });
});

gulp.task('default', ['connect']);*/


// Watches
gulp.task('watch', function() {
  gulp.watch(['**/*.scss'], ['build-css']);
  gulp.watch(config.sources.scripts, ['build-js']);
  gulp.watch(config.sources.templates, ['copy-templates']);
  gulp.watch(config.sources.rootHtml, ['copy-rootHtml']);
});

// Put all templates in Angular's template-cache
// Creates a templates.js file which will
// get combined with other scripts in the build-js task
/*gulp.task('cache-templates', function() {
  return gulp.src(config.sources.templates)
    .pipe(templateCache('templates.js', { module: config.name}))
    .pipe(gulp.dest('app'))
    .pipe(connect.reload());
});*/

// Build style
// Compile Sass into a single file
gulp.task('build-css', function() {
  return gulp.src(config.sources.style)
    
      .pipe(sass())
    
    .pipe(gulp.dest('app/build/app-ui/css'))
    .pipe(connect.reload());
});


gulp.task('build-js', function() {
	return gulp.src(config.sources.scripts)		
	    .pipe(concat('all.js'))		
		.pipe(gulp.dest('app/build/app-ui/js'))			
		.pipe(connect.reload());	
});

gulp.task("copy-fonts", function(){
	return gulp.src(config.sources.fonts)
		.pipe(gulp.dest('app/build/app-ui/fonts'));
});

gulp.task("copy-images", function(){
	return gulp.src(config.sources.images)
	    .pipe(minifyimage())
		.pipe(gulp.dest('app/build/app-ui/images'));
});

gulp.task("copy-templates", function(){	
	return gulp.src(config.sources.templates)
		.pipe(flatten())
		.pipe(gulp.dest('app/build/app-ui/html'));
});

gulp.task("copy-rootHtml", function(){
	return gulp.src(config.sources.rootHtml)
		.pipe(gulp.dest('app/build/app-ui'));
});



gulp.task("copy-favicon", function(){
	return gulp.src(config.sources.favicon)
		.pipe(gulp.dest('app/build/'));
});


// Bumps versions in package.json and bower.json
// and creates a git tag based off the new version number
gulp.task('tag', function() {
  gulp.src(['./package.json', './bower.json'])
    .pipe(bump())
    .pipe(gulp.dest('./'))    
    .pipe(filter('package.json'))
    .pipe(tag({ prefix: '' }));
});


gulp.task('default', function() {
	runSequence(			
			['copy-fonts', 'copy-images', 'build-css', 'build-js', 'copy-rootHtml',  'copy-templates', 'copy-favicon'],			
			'watch',
			'connect'
			);
});


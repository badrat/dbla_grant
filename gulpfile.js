var gulp = require('gulp');
var gls = require('gulp-live-server');
var uglify = require('gulp-uglify');
var pipeline = require('readable-stream').pipeline;

gulp.task( 'default', [ 'serve' ] );

gulp.task('serve', function() {
	//1. run your script as a server
	var server = gls.new('app.js');
	server.start();

	//use gulp.watch to trigger server actions(notify, start or stop)
	gulp.watch(['public/**/*.less', 'views/*.ejs'], function (file) {
        server.notify.apply(server, [file]);
        server.notify.bind(server)(file);
	});
	
	gulp.watch(['routes/index.js', 'routes/api.js'], function (file) {
		server.stop();
		server.start();
	});

	// Note: try wrapping in a function if getting an error like `TypeError: Bad argument at TypeError (native) at ChildProcess.spawn`
	gulp.watch('app.js', function() {
		server.start.bind(server)()
	});

});

gulp.task('compress', function () {
	return pipeline(
		gulp.src('private/javascripts/*.js'),
		uglify(),
		gulp.dest('public/javascripts')
	);
});
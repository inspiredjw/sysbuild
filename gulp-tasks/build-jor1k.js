import es from 'event-stream';
import gulp from 'gulp';
import shell from 'gulp-shell';
import uglify from 'gulp-uglify';

gulp.task('jor1k:compile', shell.task([
		'rm -rf bin && mkdir bin',
		//'browserify -r ./js/plugins/terminal-linux.js:LinuxTerm -r ./js/master/master.js:Jor1k -o bin/jor1k-master-min.js',
		'browserify js/worker/worker.js -o bin/jor1k-worker-min.js',
		// this is a temporary solution. This is not a good idea. need to change it.
	], {
		cwd : './src/bower_modules/jor1k/',
		verbose : true
}));

// Copies Jor1k and Jork-sysroot modules
gulp.task('jor1k', ['jor1k:compile'], () => {
	const workerJs = gulp.src('./src/bower_modules/{jor1k/bin/jor1k-worker-min.js}')
		.pipe(uglify({preserveComments: 'some'}));
	const sysFiles = gulp.src('./src/bower_modules/{jor1k-sysroot/{fs.json,fs/**,or1k/**}}');
	return es.concat(workerJs, sysFiles)
		.pipe(gulp.dest('./dist/bower_modules/'));

});
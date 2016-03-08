import gulp from 'gulp';
import connect from 'gulp-connect';
import BabelTranspiler from './babel-transpiler';
import './build-jor1k';

// Starts a simple static file server that transpiles ES6 on the fly to ES5
gulp.task('serve:src', ['jor1k:compile', 'css:watch'], () => {
    var root = 'src'; // this is relative to project root
    return connect.server({
        root: root,
        middleware: (connect, opt) => {
            return [(new BabelTranspiler(root)).connectMiddleware()];
        }
    });
});

// Starts a simple static file server that transpiles ES6 on the fly to ES5
gulp.task('serve:test', ['jor1k:compile', 'lint:test:watch'], () => {
    var root = '.'; // this is relative to project root
    return connect.server({
        root: root,
        middleware: (connect, opt) => {
            return [(new BabelTranspiler(root)).connectMiddleware()];
        }
    });
});

// Starts a trivial static file server
gulp.task('serve:dist', () => {
    return connect.server({ root: './dist' });
});

gulp.task('serve', ['serve:src']);

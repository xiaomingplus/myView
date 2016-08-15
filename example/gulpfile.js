var gulp = require('gulp');
var map  = require('map-stream');
var through2 = require('through2');
var combiner = require('stream-combiner2');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var path = require('path');
gulp.task('deps',function(){
  //todo 分析所有文件，并给出依赖。
});
gulp.task('dev', function() {
  // var combined = combiner.obj([
  //       gulp.src(['./src/**/*.js']),
  //       through2.obj(function(file,enc,cb){
  //         console.log('1');
  //         cb(null,file);
  //       }),
  //       through2.obj(function(file,enc,cb){
  //         console.log('2');
  //         list.push(file.path);
  //         cb(null,file);
  //       }),
  //       through2.obj(function(file,enc,cb){
  //         console.log(list);
  //         cb(null,file);
  //       }),
  //       map(function(data,cb){
  //         console.log(data.path);
  //         cb(null,data);
  //       }),
  //       gulp.dest('./dist/js/')
  //   ])
  //   combined.on('error', function(e){
  //     console.log(e);
  //   });

    var cb2 = combiner.obj([
      gulp.src('./src/*.html'),
      (function(rs){
        var list = [];
        var deps = [];
        rs.pipe(through2.obj(function(file,enc,cb){
          // console.log(file.path);
          // todo 分析require依赖并写入
          console.log('222');
          cb(null,file);
        })).on('data',function(){

        }).on('end',function(){
          console.log('end');
        });

        return through2.obj(function(file,enc,cb){
          cb(null,file);
        });

      })(gulp.src('./src/**/*.js'))
    ]);
    cb2.on('error',function(e){
      console.log(e);
    })
    return cb2;

    // return gulp.src(['./src/**.js','./src/**/*.js'])
    //     .pipe(through2.obj(function (file,enc, cb) {
    //       console.log(path.basename(file.path));
    //         // var contents = file.contents.toString('utf8');
    //         // console.log(contents);
    //         cb(null, file);
    //     }));
});

gulp.task('default', defaultTask);

function defaultTask(done) {
  // place code for your default task here
  console.log('test');
  done();
}

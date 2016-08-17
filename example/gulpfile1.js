var gulp = require('gulp');
var map  = require('map-stream');
var through2 = require('through2');
var combiner = require('stream-combiner2');
var bs = require('browser-sync').create();  // 自动刷新浏览器
var path = require('path');
var dev = require('./taskDev');

dev(gulp,{
  "livereload": {
  		"available": true,
  		"port": 8080,
  		"startPath": "index.html"
  	}
});
function depsList(content){

}

function dirFiles(dir){
  return gulp('./src/'+dir);
}
function getContents (path){
  return new Promise(function(s,f){
    gulp.src(path).pipe(through2.obj(function(file,enc){
      s(file.contents.toString());
    }));
  })
}

function insert(contents,regex,insertContents){
  var regx = new RegExp(regex);
  return contents.replace(regx,insertContents+regex);
}
gulp.task('deps',function(){
  //todo 分析所有文件，并给出依赖。
  gulp.src('./src/')
});

gulp.task('d',function(){
  //这里全部不这样注入，直接引入js文件
  gulp.src('./src/index.html').pipe(through2.obj(function(file,enc,cb){
    var html = file.contents.toString();
    return getContents('./src/common/module.js').then(function(modulejsCode){
      return insert(html,'<\/body>',`<script>${modulejsCode}</script>`);
    }).then(function(html){
      // 获取所有模块的模块名和路径
      // return insert(html,'<\/body>',`<script>${modules}</script>`);
      // console.log(html);
      return getContents('./deps.js').then(function(modules){
        return insert(html,'<\/body>',`<script>${modules}</script>`);
      });
    }).then(function(html){
      return getContents('./src/entra/exampleEntra.js').then(function(entraCode){
        return insert(html,'<\/body>',`<script>${entraCode}</script>`);
      });
    }).then(function(html){
      file.contents = new Buffer(html,'utf-8');
      cb(null,file);
    });

  })).pipe(gulp.dest('dev'))
})

gulp.task('modules',function(){

  gulp.src('./src/**/*.js').pipe(through2.obj(function(file,enc,cb){
    // 复制模块,编译模块
    // 判断是什么模板
    // 生成modulePackage.js
    //
    cb(null,file);
  }).pipe(gulp.dest('dev/_modules/')))
});

gulp.task('watch',function(){
  //监听用户文件变动，自动刷新
  //生成package.js
  //刷新浏览器
})
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
    //test

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

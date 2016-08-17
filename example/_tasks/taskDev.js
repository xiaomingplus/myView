var del = require('del');
var bs = require('browser-sync').create(); // 自动刷新浏览器
var through2 = require('through2');
var utils = require('./utils');
var babel = require('babel-core');
var path = require('path')
var gulpFile = require('gulp-file');
var gutil = require('gulp-util')
var paths = {
  src: {
    dir: './src',
    js: './src/**/*.js',
    tpl: ['./src/**/tpl_*.html'],
    entraHtml:'./src/index.html',
    dirName:'src'
  },
  dev: {
    dir: "./dev",
    js:['./dev/**/*.js','./dev/**/tpl_*.html'],
    entraHtml:'./dev/index.html',
    entraJs:'./entra/exampleEntra.js',
    moduleJs:'./common/module.js',
    moduleJsPackage:"./moduleJsPackage.js",
    dirName:'dev'
  }
}
module.exports = function(gulp, config) {
  // 复制操作
  var copyHandler = function(type, file, base,done) {
    file = file || paths['src'][type];
    return gulp.src(file, {
        base: base ? base : paths.src.dir
      })
      .pipe(gulp.dest(paths.dev.dir))
      .on('end', function(){
        done();
      });
  };

  // 自动刷新
  var reloadHandler = function() {
    config.livereload && bs.reload();
  };

  //清除目标目录
  function delDev() {
    return del([paths.dev.dir]);
  }
  //启动 livereload
  function startServer() {
    bs.init({
      server: paths.dev.dir,
      port: config['livereload']['port'] || 8080,
      startPath: config['livereload']['startPath'] || paths.dev.dir+'/index.html',
      reloadDelay: 0,
      notify: { //自定制livereload 提醒条
        styles: [
          "margin: 0",
          "padding: 5px",
          "position: fixed",
          "font-size: 10px",
          "z-index: 9999",
          "bottom: 0px",
          "right: 0px",
          "border-radius: 0",
          "border-top-left-radius: 5px",
          "background-color: rgba(60,197,31,0.5)",
          "color: white",
          "text-align: center"
        ]
      }
    });
  }
  //复制js
  function copyJs(done,file,cb) {
    return copyHandler('js',file?file:null,null,function(){
      if(cb){
        cb();
      }
    })
  }
  //处理未注释的script标签
  function commentsHandler(content) {
    var code = utils.insert(content, '<script', '//');
    code = utils.insert(code, '<\/script>', '//');
    return code;
  }
  function insertScript(content,src){
    return utils.insert(content,'<\/body>',`<script src="${src}"></script>`)
  }
  //编译html入口
  function compileEntraHtml(){
    return gulp.src(paths.src.entraHtml).pipe(
      through2.obj(function(file,enc,cb){
        var code = file.contents.toString();
        code = insertScript(code,paths.dev.moduleJs);
        code = insertScript(code,paths.dev.moduleJsPackage);
        code = insertScript(code,paths.dev.entraJs);
        file.contents = new Buffer(code);
        file.path = paths.dev.dir+'/index.html'
        cb(null,file);
      })
    ).pipe(gulp.dest(paths.dev.dir))
  }

  //编译modulejspackage
  function generatePackage(cb){
    return defineListPlugin(gulp.src(paths.dev.js)).then(function(alias){
      var defs = {};
      for(var v in alias){
        var relative = path.relative(paths.dev.dir,alias[v]);
        defs[v] = './'+relative;
      }
      var aliasString = JSON.stringify(defs);
      var code = `modulejs.config({
            /**
             * 初始化配置,alias为必选参数,在这里设置所有声明的模块名和对应的路径,路径除了支持相对路径，http方式的线上路径等。
             */
            alias: ${aliasString}
        });`
      gulpFile('moduleJsPackage.js',code).pipe(
        gulp.dest(paths.dev.dir)
      ).on('end',function(){
        cb()
      })
    });
  }
  // 编译react
  function compileReactWithCheck() {
    return through2.obj(function(file, enc, cb) {
      var code = file.contents.toString();
      var isReact = utils.existContents(code, 'type=\"text\/jsx\"');
      if (isReact) {
        code = commentsHandler(code);
        var res = babel.transform(code, {
          presets: ['react']
        });
        file.contents = new Buffer(res.code);
      }
      cb(null, file);
    });
  }
  //编译模版
  function compileTpl(done,file,cb) {
    //todo 先检测script的类型，然后给script前面加//注释，然后在交给babel处理
    //利用gulpif判断是否为react模版，如果是react模版则交给babel处理
    return gulp.src(file?file:paths.src.tpl,{base:paths.src.dir}).pipe(
      compileReactWithCheck()
    ).pipe(
      gulp.dest(paths.dev.dir)
    ).on('end', function(){
      if(cb){
        cb();
      }
    })
  }
  //分析模块名和依赖
  function defineListPlugin(rs,done){
    //todo 分析所有文件，并给出所有定义的模块以及路径。
    //识别define找到定义
    function findDefine(content){
      var defines = [];
      //匹配所有的define,除了"",还有单引号'',也允许没找到
      var regx = /define\((?:\"|\')((?:\w|\.)+?)(?:\"|\')/g;
      var definesRegx =content.match(regx);
      if(definesRegx){
        for (var i=0;i<definesRegx.length;i++){
          //匹配模块名
          var moduleNameRegx = definesRegx[i].match(/define\((?:\"|\')((:?\w|\.)+?)(?:\"|\')/);
          var moduleName = moduleNameRegx[1].trim();
          if(moduleName){
            defines.push(moduleName);
          }
        }
      }
      return defines;
    }
    var deps = {};
    return new Promise(function(s,f){
      gulp.src(paths.dev.js).pipe(through2.obj(function(file,enc,cb){
        if (file.isNull()) {
          cb(null, file);
          return;
        }
        // todo 分析require依赖并写入
        var content = file.contents.toString();
        var defineList = findDefine(content);
        for(var i=0;i<defineList.length;i++){
          deps[defineList[i]] =file.path;
        }
        cb(null,file);
      })).on('data',function(){

      }).on('end',function(){
        // console.log('end');
        s(deps);
      }).on('error',function(error){
        f(error);
      });
    });

  }
  var watchHandler = function (type, file) {
    // var target = file.match(/^src[\/|\\](.*?)[\/|\\]/)[1];
    var target = '';
    if(/tpl_/.test(file)){
      target = 'tpl';
    }else if(/\.js/.test(file)){
      target = 'js';
    }
    switch (target) {
        case 'js':
            if (type === 'removed') {
              //这里可能需要替换
                var tmp = file.replace(paths.src.dirName, paths.dev.dirName);
                del([tmp]).then(function(){
                  generatePackage(function(){
                    reloadHandler()
                  })
                });
            }else {
                copyJs(null,file,function(){
                  generatePackage(function(){
                    console.log('test');
                    reloadHandler()
                  })
                });
            }
            break;

        case 'tpl':
            if (type === 'removed') {
                var tmp = file.replace(paths.src.dirName, paths.dev.dirName);
                del([tmp]).then(function(){
                  generatePackage(function(){
                    reloadHandler()
                  } )
                });
            } else {
                compileTpl(null,file,function(){
                  reloadHandler()
                });
            }
            break;

          default:
          console.log('没有匹配到处理程序');
          break;
    }

};


  //监听文件
  function watch(cb) {
      var watcher = gulp.watch([
              paths.src.tpl,
              paths.src.js
          ],
          {ignored: /[\/\\]\./}
      );
      watcher
          .on('change', function (file) {
              gutil.log(file + ' has been changed');
              watchHandler('changed', file);
          })
          .on('add', function (file) {
              gutil.log(file + ' has been added');
              watchHandler('add', file);
          })
          .on('unlink', function (file) {
              gutil.log(file + ' is deleted');
              watchHandler('removed', file);
          });

      cb();
  }
  gulp.task('dev', gulp.series(
    delDev,
    gulp.parallel(
      copyJs,
      compileTpl
    ),
    generatePackage,
    compileEntraHtml,
    watch,
    startServer
  ));
  gulp.task('del', delDev);
}

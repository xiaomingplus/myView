var gulp = require('gulp');
var through2 = require('through2');
module.exports = {
   dirFiles:function(dir){
  return gulp('./src/'+dir);
},
 getContents:function (path){
  return new Promise(function(s,f){
    gulp.src(path).pipe(through2.obj(function(file,enc){
      s(file.contents.toString());
    }));
  })
},
 insert:function(contents,regex,insertContents){
  var regx = new RegExp(regex);
  var code = contents.replace(regx,insertContents+regex);
  return code;
},
 existContents:function(contents,str){
   var regx = new RegExp(str);
   return regx.test(contents);
 }
}

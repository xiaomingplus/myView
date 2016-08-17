define('page2', function(require, exports, module) {
    exports.first = function(view) {
        view.setContent('<p>页面二的first方法</p><a href="#page1=first">跳转到页面一的first方法</a><br><br><a href="#page1=second">跳转到页面一的second方法</a>');
    };


});

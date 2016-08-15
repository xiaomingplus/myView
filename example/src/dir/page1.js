define('page1', function(require, exports, module) {

    /**
     * [myView的action,会传入当前的实例化的view,view的api见下]
     * @param  {[type]} view [description]
     * @return {[type]}      [description]
     */
    exports.first = function(view) {

        /**
         * [setContent 给当前页面填充html]
         * @param {[type]} '<p>页面一的first方法</p><a href="#page1=second">跳转到页面一的second方法</a><br><br><a href="#page2=first">跳转到页面二的first方法</a>' [description]
         */
        view.setContent('<p>页面一的first方法</p><a href="#page1=second">跳转到页面一的second方法</a><br><br><a href="#page2=first">跳转到页面二的first方法</a>');

        //异步回调请使用view的callbackProxy封装，以防hash切换后异步回调才开始执行导致的问题
        setTimeout(view.callbackProxy(function() {
            console.log('调用view的callbackProxy方法来封装回调');
        }), 2000);

        //或者如果要使用setTimeout方法时，可使用myView提供的封装,在hash切换后会进行销毁
        view.setTimeout(function() {
            console.log('调用view的setTimeout方法');
        }, 3000)

    };

    exports.second = function(view) {
        view.setContent('<p>页面一的second方法</p><a href="#page1=first">跳转到页面一的first方法</a><br><br><a href="#page2=first">跳转到页面二的first方法</a>');

    }
});

define('extender', function(require, exports, module) {
    exports._extenderInit = function(cfg) {
        console.log('extender handle'); //在这里可以进行一些基类的处理
    };

    exports._modelRouteMap = {
        "route1": "page1" //模块路由映射
    }

});

/**
 * [_mytouchConfig,myView的配置,参数见下面的解释]
 * @type {Object}
 */
var _mytouchConfig = {
    "index": ['page1', 'first'], //当hash不存在的时候，默认请求的module和action,数组的第一项是module,第二项是action
    "extender": 'extender', //view方法扩展器
    "containerId": "container", //主容器id
    "moduleActionMap": {
        "module1": {
            "first": ['page1', 'first'],
            "second": ['page2', 'second']
        } //action路由映射，可以给某些action设置别名
    },
    "modelRouteMap":{
      "moduleTest":"page1"
    } //module路由映射
}
modulejs('myView', function(m) {
    m.init();
}); //按照modulejs规范，引入myView模块，然后调用myView的init方法来初始化

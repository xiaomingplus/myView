modulejs.config({
            /**
             * 初始化配置,alias为必选参数,在这里设置所有声明的模块名和对应的路径,路径除了支持相对路径，http方式的线上路径等。
             */
            alias: {"extender":"./extender.js","inf":"./common/inf.js","jquery":"./common/jquery.js","_init":"./common/module.js","myView":"./common/myView.js","page1":"./dir/page1.js","page2":"./dir/page2.js","tpl_ex.guobao_test":"./dir/tpl/tpl_zz.html"}
        });
let http = require('http');
let url = require('url');
function createApplication() {
    let app = (req, res) => {
        // 该方法内编写核心逻辑
        // 1. 获取请求的方法
        let m = req.method.toLowerCase();
        // 2. 获取请求的路径
        let { pathname } = url.parse(req.url, true);

        // 通过next方法进行迭代
        let index = 0; // 取第一个路由
        function next(err) {
            // 如果数组全部迭代完成还没有找到  说明路径不存在
            if(index === app.routes.length) return res.end(`Cannot ${m} ${pathname}`);

            let { method, path, handler } = app.routes[index++];
            if(method === 'middle') { // 处理中间件
                if(path === '/' || path === pathname || pathname.startsWith(path + '/')) {
                    handler(req, res, next);
                } else {
                    next(err); // 如果这个中间件没有匹配到  那么就继续走下一个layer
                }
            } else {
                // 处理路由
                if((method === m || method === 'all') && (path === pathname || path === '*')) {
                    handler(req, res);
                } else {
                    next();
                }
            }
        }

        next()

        // for(let i = 0; i < app.routes.length; i++) {
        //     let { method, path, handler } = app.routes[i];
        //     if((method === m || method === 'all') && (path === pathname || path === '*')) {
        //         handler(req, res);
        //     }
        // }

        // res.end(`Cannont ${m} ${pathname} `);
    }

    app.routes = []; // 存放所有的路由对象

    app.use = function(path, handler) {
        // 处理中间件参数的问题
        if(typeof handler !== 'function') {
            handler = path;
            path = '/';
        }

        let layer = {
            method: 'middle', // method是middle就表示是一个中间件
            path,
            handler
        }
        app.routes.push(layer); // 将中间件放到容器内
    }

    http.METHODS.forEach(method => {
        method = method.toLowerCase(); // 将方法名转换为小写
        /**
         * path: 路径
         * handler：监听函数 
         */
        app[method] = function(path, handler) {
            let layer = {
                method,
                path,
                handler
            }
            app.routes.push(layer);
        }
    })

    app.all = function(path, handler) {
        let layer = {
            method: 'all', // 如果method是all，表示全部匹配
            path,
            handler
        }
        app.routes.push(layer);
    }

    // express 内置中间件
    app.use(function(req, res, next) {
        let {pathname, query} = url.parse(req.url, true);
        let hostname = req.headers['host'].split(':')[0];
        req.path = pathname;
        req.query = query;
        req.hostname = hostname;
        next()
    })
    
    app.listen = function() {
        let server = http.createServer(app);
        server.listen(...arguments);
    }

    return app;
}

module.exports = createApplication;
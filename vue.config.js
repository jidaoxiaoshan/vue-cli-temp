const path = require('path');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
let isProduction = process.env.NODE_ENV === 'production';
const cdn = {
    css: [],
    js: [
        'https://cdn.bootcss.com/vue/2.6.10/vue.runtime.min.js',
        'https://cdn.bootcss.com/vue-router/3.1.3/vue-router.min.js',
        'https://cdn.bootcss.com/vuex/3.1.2/vuex.min.js',
        'https://cdn.bootcss.com/axios/0.19.0/axios.min.js',
        'https://cdn.bootcss.com/element-ui/2.12.0/index.js',
    ]
};
function resolve(dir) {
    return path.join(__dirname, './', dir)
}

// 压缩js
const compress = new CompressionWebpackPlugin(
    {
        filename: info => {
            return `${info.path}.gz${info.query}`
        },
        algorithm: 'gzip',
        threshold: 10240,
        test: new RegExp(
            '\\.(' +
            ['js'].join('|') +
            ')$'
        ),
        minRatio: 0.8,
        deleteOriginalAssets: false
    }
);
module.exports = {
    publicPath: isProduction
        ? '/pro/'
        : '/',
    outputDir: "dist",
    assetsDir: 'static',
    lintOnSave: true, // 是否开启编译时是否不符合eslint提示
    devServer: {
        host: '0.0.0.0',  // 解决在局域网下无法访问
        port: 8080,
        open:true,
        proxy: {
            [process.env.VUE_APP_BASE_API]: {
                target: `http://localhost:8041`,
                changeOrigin: true,
                pathRewrite: {
                    ['^' + process.env.VUE_APP_BASE_API]: ''
                }
            }
        },
        before(app, server) {
            app.get(/.*.(js) | .*.*.(js)$/, (req, res, next) => {
                req.url = req.url + '.gz';
                res.set('Content-Encoding', 'gzip');
                next();
            })
        }
    },
    // 压缩代码
    configureWebpack: {
        plugins: [compress]
    },
    productionSourceMap: false,
    // 引入全局变量
    css: {
        extract: true,
        sourceMap: false, // 开启 CSS source maps?
        // requireModuleExtension: false,
        loaderOptions: {
            sass: {
                // 引入全局变量样式,@使我们设置的别名,执行src目录
                data: `
               @import "@/assets/css/variable.scss"; 
               @import "@/assets/css/common.scss";
               @import "@/assets/css/mixin.scss";
              `
            }
        }
    },
    // 配置
    chainWebpack: (config) => {
        // 修复HMR
        // config.resolve.symlinks(true);
        // 配置别名
        config.resolve.alias
            .set('@', resolve('src'))
            .set('assets', resolve('src/assets'))
            .set('@img', resolve('src/assets/images'))
            .set('@com', resolve('src/components'))
            .set('@u', resolve('src/utils'));
        if (isProduction) {
            config.plugins.delete('preload'); // TODO: need list
            config.plugins.delete('prefetch'); // TODO: need list
            // 压缩代码
            config.optimization.minimize(true);
            // 分割代码
            config.optimization.splitChunks({
                chunks: 'all'
            });
            // 用cdn方式引入
            config.externals({
                'vue': 'Vue',
                'vuex': 'Vuex',
                'vue-router': 'VueRouter',
                'element-ui': 'ELEMENT',  // 需用MINT
                'axios': 'axios'
            });
                // 生产环境注入cdn
                config.plugin('html')
                    .tap(args => {
                        args[0].cdn = cdn;
                        return args;
                    });
        }
    },
}

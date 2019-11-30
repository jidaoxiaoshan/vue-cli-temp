// 去除生产环境的consoles
let plugins = {};  // 防止报错，需用{}
if (['production', 'prod'].includes(process.env.NODE_ENV)) {
    plugins = "transform-remove-console"
}
module.exports = {
    presets: [["@vue/app", {"useBuiltIns": "entry"}]],
    plugins: [
        plugins,
        [
            "component",
            {
                "libraryName": "element-ui",
                "styleLibraryName": "theme-chalk",
                "style": true
            }
        ]
    ]
};

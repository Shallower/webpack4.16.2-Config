const siteConfig = require('./utils');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const glob = require('glob');
const extractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack');
//解决css抽离后js和css压缩的问题
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const optimizeCss = require('optimize-css-assets-webpack-plugin');

module.exports = {
  // mode: 'development', //开发环境：development  生产环境：production
  //入口文件配置项
  entry: {
    //里面得main是可以随便写的
    main: './src/main.js'
  },
  //出口文件得配置项
  output: {
    //打包的路径
    path: path.resolve(__dirname, '../dist'),
    //打包的文件名
    filename: '[name].js', //这里的name告诉我们的是进去得是什么名字出来的就是什么名字
    publicPath: siteConfig.publicPath //publicPath：主要作用就是处理静态文件路径的。
  },
  //模块：例如解读CSS，图片如何转换，压缩
  module: {
    rules: [
      //css loader
      {
        test: /\.css$/,
        use: extractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader'
            },
            {
              loader: 'postcss-loader'
            }
          ]
        })
      },
      //图片 loader
      {
        test: /\.(png|jpg|gif|jpeg)/, //是匹配图片文件后缀名称
        use: [
          {
            loader: 'url-loader', //是指定使用的loader和loader的配置参数
            options: {
              limit: 500, //是把小于500B的文件打成Base64的格式，写入JS
              outputPath: 'images/' //打包后的图片放到images文件夹下
            }
          }
        ]
      },
      //处理html中的图片
      {
        test: /\.(htm|html)$/i,
        use: ['html-withimg-loader']
      },
      //less loader
      {
        test: /\.less$/,
        use: extractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader'
            },
            {
              loader: 'less-loader'
            },
            { loader: 'postcss-loader' }
          ],
          // use style-loader in development
          fallback: 'style-loader'
        })
      },
      //scss loader
      {
        test: /\.scss$/,
        use: extractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader'
            },
            {
              loader: 'sass-loader'
            },
            { loader: 'postcss-loader' }
          ],
          // use style-loader in development
          fallback: 'style-loader'
        })
      },
      //babel 配置
      {
        test: /\.(jsx|js)$/,
        use: {
          loader: 'babel-loader'
        },
        exclude: /node_modules/
      }
    ]
  },
  //插件，用于生产模板和各项功能
  plugins: [
    new HtmlWebpackPlugin({
      minify: {
        //是对html文件进行压缩
        removeComments: true, //移除HTML中的注释 (生产环境使用)
        collapseWhitespace: true, //删除空白符与换行符 (生产环境使用)
        removeAttributeQuotes: true //removeAttrubuteQuotes是去掉属性的双引号 (生产环境使用)。
      },
      hash: true, //为了开发中js有缓存效果，所以加入hash，这样可以有效避免缓存JS。
      template: './src/index.html' //是要打包的html模版路径和文件名称。
    }),
    new extractTextPlugin('css/index.css'), //这里的/css/index.css 是分离后的路径
    //使用消除未使用的样式，需要放到extractTextPlugin插件调用的后面
    new PurifyCSSPlugin({
      //这里配置了一个paths，主要是需找html模板，purifycss根据这个配置会遍历你的文件，查找哪些css被使用了。
      paths: glob.sync(path.join(__dirname, '../src/*.html'))
    })
  ],
  //这个配置是用来处理优化配置的，它将会覆盖webpack默认的js压缩（其他测试中），
  //所以这里要使用UglifyJsPlugin()重新压缩一下js，optimizeCss({})压缩抽离出来的css
  optimization: {
    minimize: true,
    minimizer: [new UglifyJsPlugin(), new optimizeCss()]
  }
};

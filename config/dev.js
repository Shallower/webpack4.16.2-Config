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
  //配置webpack开发服务功能
  devServer: {
    //设置基本目录结构
    contentBase: path.resolve(__dirname, '../dist'),
    //服务器得IP地址，可以使用IP也可以使用localhost
    host: siteConfig.host,
    //服务器端压缩是否开启
    compress: true,
    //配置服务端口号
    port: siteConfig.port
  }
};

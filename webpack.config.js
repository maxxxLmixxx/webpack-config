const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const TerserWebpackPlugin = require('terser-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    }
    if (isProd) {
        config.minimizer = [
            new TerserWebpackPlugin(),
            new OptimizeCssAssetsPlugin()
        ]
    }
    return config
}


const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

const cssLoaders = extra => {
    const loaders = [{
        loader: MiniCssExtractPlugin.loader,
        options: {
            hmr: isDev,
            reloadAll: true
        }
    },
        // [add styles to html head, import .css to .js]
        'css-loader' 
    ]

    if (extra) {
        loaders.push(extra)
    }

    return loaders;
}

const babelOptions = preset => {
    const options = {
        presets: [
            '@babel/preset-env',
        ], 
    }

    if(preset) {
        options.presets.push(preset)
    }

    return options
}

module.exports = {
    context: path.resolve(__dirname, 'src'), // only absolute path

    mode: 'development', // mode: 'production',

    entry: {
        main: ['@babel/polyfill', './javascript/main.js'],
        independent: './javascript/independent.js'
    },
    output: {
        filename: filename(`js`),
        path: path.resolve(__dirname, 'dist')
    },

    resolve: { // extensions by default
        extensions: ['.js', '.json', '.png', 'jpg', '.jpeg'],
        alias: {
            '@fonts': path.resolve(__dirname, 'src/models'),
            '@': path.resolve(__dirname, 'src/models')
        }
    },
    optimization: optimization(),
    devServer: {
        port: 3000,
        hot: isDev
    },
    devtool: isDev ? 'source-map' : '',

    plugins: [ // only instances of Classes
        new HTMLWebpackPlugin({ // set entry point
            template: './index.html',
            minify: {
                collapseWhitespace: isProd
            }
        }),
        new CleanWebpackPlugin(), // clean output.path
        new CopyWebpackPlugin([
            {
                from: '',
                to: ''
            }
        ]),
        new MiniCssExtractPlugin({
            filename: filename(`css`),
        })
    ],
    // allows to work with different file types
    // except javascript // default extensions '.js', '.json'
    module: {
        rules: [
            { //? import css to javascript
                test: /\.css$/,
                use: cssLoaders()
            },

            { //? scss
                test: /\.s[ac]ss$/,
                use: cssLoaders('sass-loader')
            },

            { //? import images to javascript
                test: /\.(png|jpeg|jpg|bmp|svg|gif|web)$/,
                use: ['file-loader']
            },

            { //? use fonts at css
                test: /\.(ttf|woff|woff2|eot)$/,
                use: ['file-loader']
            },
            
            { //? babel-loader
                test: /\.js$/,
                exclude: /node_modules/,
                loader: {
                    loader: 'babel-loader',
                    options: babelOptions()
                }
            }, 

            { //? typescript-loader
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: {
                    loader: 'babel-loader',
                    options: babelOptions('@babel/preset-typescript')
                }
            }, 

            { //? react-loader
                test: /\.jsx$/,
                exclude: /node_modules/,
                loader: {
                    loader: 'babel-loader',
                    options: babelOptions('@babel/preset-react')
                }
            },

            // {
            //     test: /\.xml$/, 
            //     use: ['xml-loader']
            // },

            // npm i -D papaparse
            //     test: /\.csv$/, 
            //     use: ['xml-loader']
            // },
        ]
    }
}
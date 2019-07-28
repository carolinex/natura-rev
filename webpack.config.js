const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'bundle.js',
    publicPath: ''
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			},
			{
			  test: /\.(s?css)$/,
			  use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
			},
      /*{
        test: /\.(jpe?g|png|gif)$/,
        use: [{
          // inline if smaller than 10 KB, otherwise load as a file
          loader: 'url-loader',
          options: {
            limit: 10000
          }
        }]
      },*/
			{
				test: /\.html$/,
				use: ['html-loader']
			},
			{
			  test: /\.(mov|mp4)$/,
			  use: [
			    {
			      loader: 'file-loader',
			      options: {
			        name: 'video/[name].[ext]'
			      }
			    }
			  ]
			},
      {
        test: /\.(eot|ttf|woff2?|otf)$/,
        use: 'file-loader'
      },
			{
        test: /\.(jpe?g|png|gif|svg)$/,
        use: [
					{
	          loader: 'file-loader',
	          options: {
	            name:'images/[name].[ext]'
          	}
        	}
				]
      }
		]
	},
  devServer: {
    contentBase: "dist",
		overlay: true,
		historyApiFallback: false
  },
	devtool: false,
	plugins: [
		new CopyWebpackPlugin([
        { from: './src/images', to: 'images' },
				/*{ from: './src/video', to: 'video' },*/
				{ from: './src/data', to: 'data' }
		]),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: './src/html/index.html'
		})
	],
	performance: {
	  hints: false
	}
	//.concat(htmlPlugins)
}

'use strict';

// A css post handler that will add vendor prefix for css files or compiled css files.
const autoprefixer = require('autoprefixer');
// An useful path tool.
const path = require('path');
// Enable more threads build, use process to emulate.
const HappyPack = require('happypack');
// Shared thread pool.
const happyThreadPool = HappyPack.ThreadPool({size: 8});
// Protagonist of the party.
const webpack = require('webpack');
// Create html file to serve the webpack bundles.
const HtmlWebpackPlugin = require('html-webpack-plugin');
// This is an extension plugin for the html-webpack-plugin that simplifies the creation of HTML
// files to serve your webpack bundles.
// const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
// Enforces the path of all required modules match the exact case of the actual path on disk.
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
// Will work with html-webpack-plugin 2.x version to interpolate custom variables into
// the html file, and just think that it is a template resolve engine.
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
// When we use '$ npm install' to install an un-existing module will occur a project rebuild
// automatically, for a better experience, webpack should make this as the default behavior.
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
// This is a custom ESLint formatter that work well with this build tool's console output.
const eslintFormatter = require('react-dev-utils/eslintFormatter');
// This plugin will ensure that relative imports from app's source directory don't reach outside of it.
// For this case, it will restrict all the module imports under the 'src/' folder, if not, it will throw
// out an error in the build process.
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
// A method to get the environment variables of current client for injection.
const getClientEnvironment = require('./env');
// The pre-configured paths.
const paths = require('./paths');

// Webpack uses `publicPath` to determine where the app is being served from.
// In development, we always serve from the root. This makes config easier.
const publicPath = '/';
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_PATH%/xyz looks better than %PUBLIC_PATH%xyz.
const publicUrl = '';
// Get environment variables to inject into our app.
const env = getClientEnvironment(publicUrl);

// This is the development configuration.
// It is focused on developer experience and fast rebuilds.
// The production configuration is different and lives in a separate file.
module.exports = {
    // You may want 'eval' instead if you prefer to see the compiled output in DevTools.
    // See the discussion in https://github.com/facebookincubator/create-react-app/issues/343.
    devtool: 'cheap-module-source-map',
    // These are the "entry points" to our application.
    // This means they will be the "root" imports that are included in JS bundle.
    // The first two entry points enable "hot" CSS and auto-refreshes for JS.
    entry: [
        // Capture all changes
        // If we introduce this patch, some non-capturing error will occur in some very
        // old version browsers, so if you want your App be compatible with these browsers,
        // you should annotate it here until this issue is solved in these browsers.
        'react-hot-loader/patch',
        // We ship a few polyfills by default:
        require.resolve('./polyfills'),
        // Include an alternative client for WebpackDevServer. A client's job is to
        // connect to WebpackDevServer by a socket and get notified about changes.
        // When you save a file, the client will either apply hot updates (in case
        // of CSS changes), or refresh the page (in case of JS changes). When you
        // make a syntax error, this client will display a syntax error overlay.
        // Note: instead of the default WebpackDevServer client, we use a custom one
        // to bring better experience for Create React App users. You can replace
        // the line below with these two lines if you prefer the stock client:
        // require.resolve('webpack-dev-server/client') + '?/',
        // require.resolve('webpack/hot/dev-server'),
        require.resolve('react-dev-utils/webpackHotDevClient'),
        // Finally, this is your app's code:
        paths.appIndexJs,
        // We include the app code last so that if there is a runtime error during
        // initialization, it doesn't blow up the WebpackDevServer client, and
        // changing JS code would still trigger a refresh.
    ],
    output: {
        // Add /* filename */ comments to generated require()s in the output.
        pathinfo: true,
        // This does not produce a real file. It's just the virtual path that is
        // served by WebpackDevServer in development. This is the JS bundle
        // containing code from all our entry points, and the Webpack runtime.
        filename: 'static/js/bundle.js',
        // There are also additional JS chunk files if you use code splitting.
        chunkFilename: 'static/js/[name].chunk.js',
        // This is the URL that app is served from. We use "/" in development.
        publicPath: publicPath,
        // Point sourcemap entries to original disk location (format as URL on Windows)
        devtoolModuleFilenameTemplate: info =>
            path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
    },
    resolve: {
        // This allows you to set a fallback for where Webpack should look for modules.
        // We placed these paths second because we want `node_modules` to "win"
        // if there are any conflicts. This matches Node resolution mechanism.
        // https://github.com/facebookincubator/create-react-app/issues/253
        modules: ['node_modules', paths.appNodeModules].concat(
            // It is guaranteed to exist because we tweak it in `env.js`
            process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
        ),
        // These are the reasonable defaults supported by the Node ecosystem.
        // We also include JSX as a common component filename extension to support
        // some tools, although we do not recommend using it, see:
        // https://github.com/facebookincubator/create-react-app/issues/290
        // `web` extension prefixes have been added for better support
        // for React Native Web.
        extensions: ['.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx'],
        alias: {
            // Support React Native Web
            // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
            'react-native': 'react-native-web',
            // High frequency used business file path simplify
            'Images': path.resolve(__dirname, '..', 'src/images/'),
            'Components': path.resolve(__dirname, '..', 'src/components/'),
            'Actions': path.resolve(__dirname, '..', 'src/redux/actions/'),
            'Reducers': path.resolve(__dirname, '..', 'src/redux/reducers/'),
            'Services$': path.resolve(__dirname, '..', 'src/services/index.js'),
            'Http': path.resolve(__dirname, '..', 'src/http/'),
        },
        plugins: [
            // Prevents users from importing files from outside of src/ (or node_modules/).
            // This often causes confusion because we only process files within src/ with babel.
            // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
            // please link the files into your node_modules/ and let module-resolution kick in.
            // Make sure your source files are compiled, as they will not be processed in any way.
            new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
        ],
    },
    module: {
        strictExportPresence: true,
        rules: [
            // TODO: Disable require.ensure as it's not a standard language feature.
            // We are waiting for https://github.com/facebookincubator/create-react-app/issues/2176.
            // { parser: { requireEnsure: false } },

            // First, run the linter.
            // It's important to do this before Babel processes the JS.
            {
                test: /\.(js|jsx|mjs)$/,
                enforce: 'pre',
                include: paths.appSrc,
                use: ['happypack/loader?id=linter'],
            },
            {
                // "oneOf" will traverse all following loaders until one will
                // match the requirements. When no loader matches it will fall
                // back to the "file" loader at the end of the loader list.
                oneOf: [
                    // "url" loader works like "file" loader except that it embeds assets
                    // smaller than specified limit in bytes as data URLs to avoid requests.
                    // A missing `test` is equivalent to a match.
                    {
                        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                        loader: require.resolve('url-loader'),
                        options: {
                            limit: 1000,
                            name: 'static/media/[name].[hash:8].[ext]',
                        },
                    },
                    // Since there is a issue needs to be solved, don't give it to HappyPack temporarily.
                    /*
                    {
                        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                        use: ['happypack/loader?id=image'],
                    },
                    */
                    // Process JS with Babel.
                    {
                        test: /\.(js|jsx|mjs)$/,
                        include: paths.appSrc,
                        use: ['happypack/loader?id=babel'],
                    },
                    // "postcss" loader applies autoprefixer to our CSS.
                    // "css" loader resolves paths in CSS and adds assets as dependencies.
                    // "style" loader turns CSS into JS modules that inject <style> tags.
                    // In production, we use a plugin to extract that CSS to a file, but
                    // in development "style" loader enables hot editing of CSS.
                    {
                        test: /\.css$/,
                        use: [
                            // Webpack's handle sequence is from bottom to top, from right to left
                            // style-loader will inject the computed css code into js bundle, and create
                            // <style> tag at <head> when js bundle running.
                            require.resolve('style-loader'),
                            {
                                loader: require.resolve('css-loader'),
                                options: {
                                    importLoaders: 1,
                                },
                            },
                            // A post-css handler
                            {
                                loader: require.resolve('postcss-loader'),
                                options: {
                                    // Necessary for external CSS imports to work
                                    // https://github.com/facebookincubator/create-react-app/issues/2677
                                    ident: 'postcss',
                                    plugins: () => [
                                        require('postcss-flexbugs-fixes'),
                                        autoprefixer({
                                            browsers: [
                                                '>1%',
                                                'last 4 versions',
                                                'Firefox ESR',
                                                'Firefox <= 26',
                                                'not ie < 9', // React doesn't support IE8 anyway
                                            ],
                                            flexbox: 'no-2009',
                                        }),
                                    ],
                                },
                            },
                        ],
                    },
                    // "file" loader makes sure those assets get served by WebpackDevServer.
                    // When you `import` an asset, you get its (virtual) filename.
                    // In production, they would get copied to the `build` folder.
                    // This loader doesn't use a "test" so it will catch all modules
                    // that fall through the other loaders.
                    {
                        // Exclude `js` files to keep "css" loader working as it injects
                        // it's runtime that would otherwise processed through "file" loader.
                        // Also exclude `html` and `json` extensions so they get processed
                        // by webpacks internal loaders.
                        exclude: [/\.js$/, /\.html$/, /\.json$/, /\.(css)$/, /\.less$/, /\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                        use: ['happypack/loader?id=file'],
                    },
                ],
            },
            {
                test: /\.less$/,
                use: ['happypack/loader?id=less'],
            },
            // ** STOP ** Are you adding a new loader?
            // Make sure to add the new loader(s) before the "file" loader.
            {
                // test:/\.(woff|svg|eot|tff)\??.*$/,
                test:/\.(woff|eot|tff)\??.*$/,
                use: ['happypack/loader?id=font'],
            },
        ],
    },
    plugins: [
        // A HappyPack instance for js linter task.
        new HappyPack({
            id: 'linter',
            threadPool: happyThreadPool,
            verbose: true,
            loaders: [
                {
                    options: {
                        formatter: eslintFormatter,
                        eslintPath: require.resolve('eslint'),

                    },
                    loader: require.resolve('eslint-loader'),
                },
            ]
        }),
        // A HappyPack instance for image sources.
        /*
        new HappyPack({
            id: 'image',
            threadPool: happyThreadPool,
            verbose: true,
            debug: true,
            loaders: [
                {
                    loader: require.resolve('url-loader'),
                    options: {
                        limit: 100,
                        name: 'static/media/[name].[hash:8].[ext]',
                    },
                }
            ]
        }),
        */
        // A HappyPack instance for js sources.
        new HappyPack({
            id: 'babel',
            threadPool: happyThreadPool,
            verbose: true,
            loaders: [
                {
                    loader: require.resolve('babel-loader'),
                    options: {

                        // This is a feature of `babel-loader` for webpack (not Babel itself).
                        // It enables caching results in ./node_modules/.cache/babel-loader/
                        // directory for faster rebuilds.
                        cacheDirectory: true,
                        plugins: [
                            'react-hot-loader/babel'
                        ]
                    },
                }
            ]
        }),
        /*
        // A HappyPack instance for css sources.
        new HappyPack({
            id: 'css',
            threadPool: happyThreadPool,
            verbose: true,
            loaders: [
                require.resolve('style-loader'),
                {
                    loader: require.resolve('css-loader'),
                    options: {
                        importLoaders: 1,
                    },
                },
                {
                    loader: require.resolve('postcss-loader'),
                    options: {
                        // Necessary for external CSS imports to work
                        // https://github.com/facebookincubator/create-react-app/issues/2677
                        ident: 'postcss',
                        plugins: () => [
                            require('postcss-flexbugs-fixes'),
                            autoprefixer({
                                browsers: [
                                    '>1%',
                                    'last 4 versions',
                                    'Firefox ESR',
                                    'Firefox <= 26',
                                    'not ie < 9', // React doesn't support IE8 anyway
                                ],
                                flexbox: 'no-2009',
                            }),
                        ],
                    },
                },
            ]
        }),
        */
        // A HappyPack instance for all static files.
        new HappyPack({
            id: 'file',
            threadPool: happyThreadPool,
            verbose: true,
            loaders: [
                {
                    // Instructs webpack to emit the required object as file and to return its public URL
                    loader: require.resolve('file-loader'),
                    options: {
                        name: 'static/media/[name].[hash:8].[ext]',
                    },
                }
            ]
        }),
        // A HappyPack instance for less sources.
        new HappyPack({
            id: 'less',
            threadPool: happyThreadPool,
            verbose: true,
            // Webpack's loader handle sequence is from bottom to top, from right to left.
            loaders: [
                // style-loader will read the computed css string in js code and use these css strings to
                // create <style> tag inside of <head> when js bundle is running.
                {
                    loader: require.resolve('style-loader'),
                },
                // css-loader will let you to use @import and url() just like import or require method to import
                // a css file just like a module, and it will translate these files to plain js strings in CommonJS way.
                // These string codes are prepared for style-loader and extract-text-webpack-plugin. Also it supports
                // css scope, and if you need this, you can set the related configurations in options. If so, you
                // can write your css codes use ':global' or ':local' decorator.
                {
                    loader:require.resolve('css-loader'),
                },
                // A css post-handler.
                {
                    loader: require.resolve('postcss-loader'),
                    options: {
                        ident: 'postcss', // https://webpack.js.org/guides/migrating/#complex-options
                        plugins: () => [
                            // add flex bug fix codes
                            require('postcss-flexbugs-fixes'),
                            // add vendor prefix
                            autoprefixer({
                                browsers: [
                                    '>1%',
                                    'last 4 versions',
                                    'Firefox ESR',
                                    'Firefox <= 26',
                                    'not ie < 9', // React doesn't support IE8 anyway
                                ],
                                flexbox: 'no-2009',
                            }),
                        ],
                    },
                },
                // A less pre-handler, will translate less codes to pure css codes.
                {
                    loader: require.resolve('less-loader'),
                    options: {
                        // your can custom the antd theme like below
                        // modifyVars: { "@primary-color": "#1DA57A" },
                    },
                },
            ]
        }),
        // A HappyPack instance for font sources.
        new HappyPack({
            id: 'font',
            threadPool: happyThreadPool,
            verbose: true,
            loaders: [
                {
                    loader:'url-loader?name=fonts/[name].[md5:hash:hex:7].[ext]',
                }
            ]
        }),

        // Makes some environment variables available in index.html.
        // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
        // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
        // In development, this will be an empty string.
        new InterpolateHtmlPlugin(env.raw),
        // Generates an `index.html` file with the <script> injected.
        new HtmlWebpackPlugin({
            inject: true,
            template: paths.appHtml,
        }),
        // For some android smart phones' inferior default browsers, the JavaScript codes with webpack module
        // runtime imported into the index.html by the way of outer chain, will not run actually. And the
        // react dom will not be created or mounted on the target DOM in index.html, the screen of the phones
        // will be simply white without any error or logs in console tab. So, here we introduce this plugin to
        // inline the codes of main.xxxxxx.js file into the <script> tag in index.html.
        /*
        new ScriptExtHtmlWebpackPlugin({
            inline: 'bundle'
        }),
        */
        // Add module names to factory functions so they appear in browser profiler.
        new webpack.NamedModulesPlugin(),
        // Makes some environment variables available to the JS code, for example:
        // if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
        new webpack.DefinePlugin(env.stringified),
        // This is necessary to emit hot updates (currently CSS only):
        new webpack.HotModuleReplacementPlugin(),
        // Watcher doesn't work well if you mistype casing in a path so we use
        // a plugin that prints an error when you attempt to do this.
        // See https://github.com/facebookincubator/create-react-app/issues/240
        new CaseSensitivePathsPlugin(),
        // If you require a missing module and then `npm install` it, you still have
        // to restart the development server for Webpack to discover it. This plugin
        // makes the discovery automatic so you don't have to restart.
        // See https://github.com/facebookincubator/create-react-app/issues/186
        new WatchMissingNodeModulesPlugin(paths.appNodeModules),
        // Moment.js is an extremely popular library that bundles large locale files
        // by default due to how Webpack interprets its code. This is a practical
        // solution that requires the user to opt into importing specific locales.
        // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
        // You can remove this if you don't use Moment.js:
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    ],
    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    node: {
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty',
    },
    // Turn off performance hints during development because we don't do any
    // splitting or minification in interest of speed. These warnings become
    // cumbersome.
    performance: {
        hints: false,
    },
};
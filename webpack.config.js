const path = require('path');

module.exports = {
    entry: "./src/index.js",
    output: {
        filename: 'chip8bundle.js',
        path: path.resolve(__dirname, './public/js'),
    },
    mode: "none",
}
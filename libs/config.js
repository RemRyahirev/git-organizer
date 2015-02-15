/**
 * Created by Rem on 12.02.2015.
 */

var nconf = require('nconf'),
    path = require('path');

var basePath = path.resolve(__dirname, '..');

nconf.argv().env().file({file: path.resolve(basePath, 'config.json')});
nconf.set('basePath', basePath);

module.exports = nconf;
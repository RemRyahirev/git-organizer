/**
 * Created by Rem on 12.02.2015.
 */

var config = require("./libs/config"),
    App = require("./libs/app");

var app = App(config);
app.run();
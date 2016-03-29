/*eslint quotes: [2, "double"]*/
// require.js looks for the following global when initializing
var require = {
    baseUrl: ".",
    paths: {
        "bootstrap":            "bower_modules/bootstrap-sass/assets/javascripts/bootstrap.min",
        "modernizr":            "bower_modules/modernizr/modernizr",
        "crossroads":           "bower_modules/crossroads/dist/crossroads.min",
        "hasher":               "bower_modules/hasher/dist/js/hasher.min",
        "jquery":               "bower_modules/jquery/dist/jquery",
        "knockout":             "bower_modules/knockout/dist/knockout",
        "knockout-projections": "bower_modules/knockout-projections/dist/knockout-projections",
        "signals":              "bower_modules/js-signals/dist/signals.min",
        "text":                 "bower_modules/requirejs-text/text",
        "marked":               "bower_modules/marked/marked.min",
        "videojs":              "bower_modules/videojs/dist/video.min",
        "jquery-ui":            "bower_modules/jquery-ui/jquery-ui.min",
        "jquery-ui-layout":     "bower_modules/jquery-ui-layout/source/stable/jquery.layout_and_plugins.min",
        "jquery-fullscreen":    "bower_modules/jquery-fullscreen/jquery.fullscreen-min",
        "jquery-notific8":      "bower_modules/jquery-notific8/dist/jquery.notific8.min",
        "ace":                  "bower_modules/ace/lib/ace",
        "typeahead-jquery":     "bower_modules/typeahead.js/dist/typeahead.jquery.min",
        "bloodhound":           "bower_modules/typeahead.js/dist/bloodhound.min", // exports window global "Bloodhound"
        "FileSaver":            "bower_modules/FileSaver/FileSaver.min", // exports window global "saveAs"
        "Blob":                 "bower_modules/Blob/Blob", // exports window global "Blob"
        "cjs":                  "bower_modules/cjs/cjs",
        "amd-loader":           "bower_modules/amd-loader/amd-loader",
        "browserfs":            "bower_modules/browserfs/dist/browserfs.min",
        "fs":                   "bower_modules/browserfs/dist/node/core/node_fs",
        "github":               "bower_modules/github-api/github",
        "bootstrap-contextmenu":"bower_modules/bootstrap-contextmenu/bootstrap-contextmenu",
        "bootbox":              "bower_modules/bootbox.js/bootbox"
    },
    shim: {
        "bootstrap": { deps: ["jquery"] },
        "jquery-ui": { deps: ["jquery"] },
        "jquery-ui-layout": { deps: ["jquery", "jquery-ui"] },
        "jquery-fullscreen": { deps: ["jquery"] },
        "typeahead-jquery": { deps: ["jquery"] },
        "bootbox": { deps: ["jquery"] },
        "bootstrap-contextmenu": { deps: ["bootstrap"] }
    },
    packages: [
        {
            name: "jor1k",
            location: "bower_modules/jor1k/js"
        }
    ]
};

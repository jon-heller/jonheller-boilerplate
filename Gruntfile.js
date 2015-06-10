module.exports = function(grunt) {

    "use strict";

    // -------------------------------------------------------------------------
    // #### Load plugins as needed ####
    // Using a 'just in time' approach -- meaning: only load plugins when they
    // are needed -- this will automatically find, then load, any and all
    // plugins that are needed by the task currently being executed. It will
    // scan the devDependencies object, in package.json, and match any of the
    // following patterns automatically:
    //      - grunt-contrib-[task name]
    //      - grunt-[task name]
    //      - [task name]
    // For any [task name] / [plugin name] pair that can't be found by the above
    // patterns, you can find them manually by adding them as a second argument
    // using the following pattern:
    //      - task name: 'plugin name'
    // We've done that, below, with "replace: 'grunt-text-replace'", as it does
    // not conform to the three patterns that are matched automatically.
    // https://github.com/shootaroo/jit-grunt
    // -------------------------------------------------------------------------

    require('jit-grunt')(grunt, {
        replace: 'grunt-text-replace'
    });

    // -------------------------------------------------------------------------
    // #### Display task execution time ####
    // This module will display elapsed execution time of grunt tasks when they
    // are finished, right on the command line. It's useful for keeping tabs on
    // the performance of your Grunt configuration.
    // https://github.com/sindresorhus/time-grunt
    // -------------------------------------------------------------------------

    // require('time-grunt')(grunt);


    // -------------------------------------------------------------------------
    // #### Project configuration ####
    // -------------------------------------------------------------------------

    grunt.initConfig({


        // ---------------------------------------------------------------------
        // #### Variables ####
        // ---------------------------------------------------------------------

        sassPath:       'assets/scss/',
        cssPath:        'assets/css/',
        jsPath:         'assets/js/',
        bowerPath:      'vendor/',
        imgPath:        'assets/images/',
        imgFileTypes:   'gif,jpg,jpeg,png',
        docFileTypes:   '.html,.php,.twig',


        // ---------------------------------------------------------------------
        // #### Get data from package.json ####
        // Get data from the package.json file and assign it to a pkg variable.
        // ---------------------------------------------------------------------

        pkg: grunt.file.readJSON('package.json'),

        // ---------------------------------------------------------------------
        // #### Task configuration ####
        // ---------------------------------------------------------------------

        // Task: Sass compiling.
        sass: {
            // Task-wide options.
            options: {
                includePaths: ['<%= bowerPath %>foundation/scss']
            },
            // Target: development.
            dev: {
                // Target-specific options.
                options: {
                    style: "expanded",
                    lineNumbers: true,
                    sourceMap: true
                },
                // Source file(s), in the order we want to compile them.
                src: '<%= sassPath %>style.scss',
                // Destination file.
                dest: '<%= cssPath %>style.css'
            },
            // Target: production.
            prod: {
                // Target-specific options.
                options: {
                    style: "compressed"
                },
                // Source file(s), in the order we want to compile them.
                src: '<%= sassPath %>style.scss',
                // Destination file.
                dest: '<%= cssPath %>style.css'
            }
        },

        autoprefixer: {
            options: {
                map: true
            },
            dist: {
                src: '<%= cssPath %>style.css',
                dest: '<%= cssPath %>style-prefixed.css'
            }
        },

        // Task: JavaScript hinting.
        // https://github.com/gruntjs/grunt-contrib-jshint
        jshint: {
            // Task-wide options.
            options: {},
            // Target: all.
            all: {
                // Target-specific options.
                options: {},
                // Source file(s), in the order we want to hint them.
                src: [
                    'Gruntfile.js',
                    '<%= jsPath %>*.js',
                    '!<%= jsPath %>*.min.js', // ...but not minified files.
                    '!<%= jsPath %>all.js' // ...but not the concatenated file.
                ]
            }
        },

        // Task: JavaScript file concatenation.
        // https://github.com/gruntjs/grunt-contrib-concat
        concat: {
            // Task-wide options.
            options: {},
            // Target: all.
            js: {
                // Target-specific options.
                options: {
                    // Separate each concatenated script with a semicolon.
                    separator: ';',
                    stripBanners: true
                },
                // Source file(s), in the order we want to concatenate them.
                src: [
                    '<%= bowerPath %>foundation/js/foundation.min.js',                    
                    '<%= jsPath %>includes/*.js',
                    '!<%= jsPath %>*.min.js', // ...but not minified files.
                    '!<%= jsPath %>all.js' // ...but not the concatenated file.
                ],
                // Destination file.
                dest: '<%= jsPath %>all.js',
                // Warn if a given file is missing or invalid.
                nonull: true
            },
            // Empty by default, comment this out and the 'css' task concatenation below on vendor.css
            // vendor: {
            //     options: {
            //         separator: ';'
            //     },
            //     src: [
            //     ],
            //     dest: '<%= cssPath %>vendor.css',
            //     nonull: true
            // },
            css: {
                options: {
                    // Separate each concatenated script with a semicolon.
                    separator: ';'
                },                
                src: [
                    '<%= cssPath %>style-prefixed.css',
                    //'<%= cssPath %>vendor.css'
                ],
                dest: '<%= cssPath %>all.css',
                nonull: true
            }
        },

        // Task: JavaScript minification.
        // https://github.com/gruntjs/grunt-contrib-uglify
        uglify: {
            // Task-wide options.
            options: {},
            // Target: all.
            all: {
                // Target-specific options.
                options: {
                    // Report the original vs. minified file-size.
                    report: 'min',
                    sourceMap: false
                },
                // Source file(s), in the order we want to minify them.
                src: '<%= jsPath %>all.js',
                // Destination file.
                dest: '<%= jsPath %>all.min.js'
            }
        },

        cssmin: {
            minify: {
                src: '<%= cssPath %>all.css',
                dest: '<%= cssPath %>all.min.css'
            }
        },

        // Task: image minification.
        // https://github.com/gruntjs/grunt-contrib-imagemin
        imagemin: {
            // Task-wide options.
            options: {},
            // Target: all.
            all: {
                // Target-specific options.
                options: {},
                // Files to minify.
                files: [{
                    // Allow for a dynamically-built file-list.
                    expand: true,
                    // The directory to start this task within.
                    cwd: '<%= imgPath %>',
                    // Relative to the path defined in "cwd", the sub-
                    // directories and file type(s) to work on.
                    src: ['**/*.{<%= imgFileTypes %>}'],
                    // Destination location.
                    dest: '<%= imgPath %>'
                }]
            }
        },

        // Task: find and replace things in the project.
        // https://github.com/yoniholmes/grunt-text-replace
        replace: {
            // Target: bust cache. This target assumes "?cb=[any number here]"
            // has been appended to any file-path you'd like to cache-bust. For
            // example, css files, js files, image files, etc.:
            // <link rel="stylesheet" href="/lib/css/all.css?cb=1" />
            // <script src="/lib/js/all.min.js?cb=1"></script>
            // <img src="/lib/img/photo.jpg?cb=1" alt="A photo" />
            cacheBust: {
                // Scan all document file types inside of html/.
                src: ['views/html-header.twig','views/base.twig'],
                // Replacement(s) to make.
                replacements: [{
                    // From: "?cb=[any number here]".
                    from: /\?cb=[0-9]*/g,
                    // To: "?cb=[the current Unix epoch time]"
                    to: function() {
                        var uid = new Date().valueOf();
                        return '?cb=' + uid;
                    }
                }],
                // Overwrite each file.
                overwrite: true
            },
            prodCssFile: {
                // Scan all document file types inside of html/.
                src: 'views/html-header.twig',
                // Replacement(s) to make.
                replacements: [{
                    // From: "all.css".
                    from: /all\.css/,
                    // To: "all.min.css".
                    to: 'all.min.css'
                }],
                // Overwrite each file.
                overwrite: true
            },
            prodJsFile: {
                // Scan all document file types inside of html/.
                src: 'views/base.twig',
                // Replacement(s) to make.
                replacements: [{
                    // From: "all.js".
                    from: /all\.js/,
                    // To: "all.min.js".
                    to: 'all.min.js'
                }],
                // Overwrite each file.
                overwrite: true
            }
        },

        // Task: aside from creating notifications when something fails (which
        // is this task's permanent/default behavior), also create the following
        // notifications for these custom, non-failure events. The targets below
        // are utilized by requesting them via targets found in the watch task.
        // https://github.com/dylang/grunt-notify
        notify: {
            // Target: Sass.
            sass: {
                options: {
                    title: 'CSS',
                    message: 'Compiled successfully.'
                }
            },
            // Target: JavaScript.
            js: {
                options: {
                    title: 'JavaScript',
                    message: 'Hinted and concatenated successfully.'
                }
            },
            // Target: ready for production.
            goProd: {
                options: {
                    title: 'Ready for Production',
                    message: 'Ship it!'
                }
            },
            // Target: ready for development.
            goDev: {
                options: {
                    title: 'Ready for Development',
                    message: 'Make it better!'
                }
            }
        },



        // Task: when something changes, run specific task(s).
        // https://github.com/gruntjs/grunt-contrib-watch
        watch: {
            // Task-wide options.
            options: {},
            // Target: Sass.
            sass: {
                // Target-specific options.
                options: {
                },
                // Watch all sassFileTypes files inside of sassPath.
                files: '<%= sassPath %>**/*.scss',
                // Task(s) to run.
                tasks: [
                    'sass:dev',
                    'autoprefixer',
                    //'concat:vendor',
                    'concat:css',
                    'notify:sass'
                ]
            },
            // Target: css.
            // css: {
            //     // Target-specific options.
            //     options: {
            //         // Utilize Livereload.
            //         livereload: true,
            //     },
            //     // Watch all .css files inside of cssPath.
            //     files: '<%= cssPath %>all.css'
            // },
            // Target: JavaScript.
            js: {
                // Target-specific options.
                options: {
                    // Utilize Livereload.
                },
                // Watch all JavaScript files inside of jsPath.
                files: [
                    '<%= jsPath %>*.js',
                    '<%= jsPath %>includes/*.js',
                    '!<%= jsPath %>*.min.js', // ...but not minified files.
                    '!<%= jsPath %>all.js' // ...but not the concatenated file.
                ],
                // Task(s) to run.
                tasks: [
                    'concat:js',
                    'notify:js'
                ]
            },
            // Target: documents.
            docs: {
                // Target-specific options.
                options: {
                    // Utilize Livereload.
                },
                // Watch all docFileTypes inside of html/.
                files: [
                    '*{<%= docFileTypes %>}',
                    'views/*.twig'
                ]
            }
        },

        browserSync: {
            dev: {
                bsFiles: {
                    src: [
                        '<%= cssPath %>all.css',
                        '*.php',
                        '<%= jsPath %>all.js' // ...but not the concatenated file.
                    ]
                },
                options: {
                    proxy: "local.website.com",
                    watchTask: true,
                    open: false
                }
            }
        }


    });

    // Task(s) to run when typing only "grunt" in the console.
    grunt.registerTask('default', [
        'browserSync',
        'sass:dev',
        'autoprefixer',
        'concat:vendor',
        'concat:css',
        'concat:js',
        'watch'
    ]);

    // #### Task alias: "goProd" ####
    // Tasks(s) to run when it's time to convert things from development mode to
    // production mode.
    grunt.registerTask('production', [
        'sass:prod',
        'autoprefixer',
        //'concat:vendor',
        'concat:css',
        'concat:js',
        'uglify:all',
        'cssmin',
        'imagemin:all',
        'replace:cacheBust',    
        'replace:prodCssFile',
        'replace:prodJsFile'
    ]);

};
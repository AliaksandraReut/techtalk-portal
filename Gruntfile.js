'use strict';

module.exports = function (grunt) {
    var config = {
        app: './',
        dist: 'dist'
    };

    try {
        config.app = require('./bower.json').appPath || config.app;
    } catch (e) {
    }

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-ngmin');

    grunt.initConfig({
        config: config,
        watch: {
            options: {
                livereload: true
            },
            scripts: {
                files: ['scripts/{,**/}*.js'],
                tasks: ['copy:js']
            },
            css: {
                files: ['styles/css/*.css'],
                tasks: ['copy:css']
            }
        },
        ngmin: {
            controllers: {
                src: ['test/src/controllers/one.js'],
                dest: 'test/generated/controllers/one.js'
            },
            directives: {
                expand: true,
                cwd: 'test/src',
                src: ['directives/**/*.js'],
                dest: 'test/generated'
            }
        },
        concat: {
            development: {
                files: {
                    'public/js/core.js': [
                        'bower_components/angular/angular.js',
                        'bower_components/angular-route/angular-route.js',
                        'bower_components/angular-resource/angular-resource.js',
                        'bower_components/angular-cookies/angular-cookies.js'
                    ]
                }
            }
        },

        copy: {
            css: {
                expand: true,
                cwd: './styles/css/',
                src: '**',
                dest: './public/css/'
            },
            js: {
                expand: true,
                cwd: './scripts/',
                src: '{,**/}*.js',
                dest: './public/js/'
            },
            photo: {
                expand: true,
                cwd: './files/user-photo/',
                src: '*',
                dest: './public/img/user/'
            },
            images: {
                expand: true,
                cwd: './images/',
                src: '*',
                dest: './public/images/'
            },
            font: {
                expand: true,
                cwd: './styles/fonts/',
                src: '**',
                dest: './public/fonts/'
            },

            build: {
                files: {
                    'dist/': [
                        './public/{css/**, img/**}',
                        'views/**',
                        'server.js',
                        'node_modules/**'
                    ]
                }
            }
        },

        clean: {
            dist: {
                src: ['<%= config.dist %>', './.tmp'],
                force: true
            }
        }
    });

    grunt.registerTask('default', ['copy:css', 'copy:js', 'copy:font', 'copy:photo', 'copy:images', 'concat:development']);
    grunt.registerTask('build', ['clean:dist', 'copy:build', 'concat']);
};

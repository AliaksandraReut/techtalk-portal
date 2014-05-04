'use strict';

module.exports = function(grunt) {
  var config = {
      app: './',
      dist: 'dist'
    };

  try {
    config.app = require('./bower.json').appPath || config.app;
  } catch (e) {}  

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.initConfig({
    config: config,
    watch: {
      options: {
        livereload: true
      },
      scripts: {
        files: ['scripts/{,**/}*.js'],
        tasks: ['copy:development']
      }
    },
    concat: {
      development: {
        files: {
          'public/js/core.js': [
            'bower_components/jquery/dist/jquery.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-route/angular-route.js',
            'bower_components/angular-resource/angular-resource.js',
            'bower_components/angular-cookies/angular-cookies.js'
          ]
        }
      },

      production: {
      }
    },

    copy: {
      development: {
        files: [
          {
            expand: true,
            cwd: './scripts/',
            src: '{,**/}*.js',
            dest: './public/js/'
          },
          {
            expand: true,
            cwd: './files/user-photo/',
            src: '*',
            dest: './public/img/user/'
          },
          {
            expand: true,
            cwd: './styles/fonts/',
            src: '**',
            dest: './public/fonts/'
          },
          {
            expand: true,
            cwd: './styles/css/',
            src: '**',
            dest: './public/css/'
          }
        ]
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

  grunt.registerTask('default', ['copy:development', 'concat:development']);
  grunt.registerTask('build', ['clean:dist', 'copy:build', 'concat']);
};

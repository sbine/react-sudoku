module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    react: {
      jsx: {
        files: [
          {
            expand: true,
            cwd: 'src/jsx',
            src: [ '**/*.jsx' ],
            dest: 'build',
            ext: '.js'
          }
        ]
      }
    },

    copy: {
      react: {
        src: 'bower_components/react/react.min.js',
        dest: 'js/react.min.js'
      },
      underscore: {
        src: 'bower_components/underscore/underscore-min.js',
        dest: 'js/underscore.min.js'
      }
    },

    uglify: {
      build: {
        src: 'build/**/*.js',
        dest: 'js/app.min.js'
      }
    },

    watch: {
      javascript: {
        files: ['src/jsx/**/*.jsx'],
        tasks: ['react', 'uglify']
      }
    }
  });

  grunt.registerTask('build', [
    'react',
    'copy',
    'uglify'
  ]);

  grunt.registerTask('default', ['build']);
};
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

    uglify: {
      build: {
        files: {
          'js/app.min.js': ['build/app.js']
        }
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
    'uglify'
  ]);

  grunt.registerTask('default', ['build']);
};
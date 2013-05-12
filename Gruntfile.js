module.exports = function( grunt ) {

    grunt.initConfig({

        jshint: {
            options: {
                'undef': true,
                'eqeqeq': true,
                'browser': true,
                'asi': true,
                'globals': {
                    'console': true,
                    'module': true,
                    'require': true,
                    'Telekinesis': true
                }
            },
            all: ['src/**/*.js']
        },

        concat: {
            build: {
                dest: 'build/telekinesis.js',
                src: [
                    'src/telekinesis.js',
                    'src/gestures/drag.js'
                ]
            }
        },

        uglify: {
            build: {
                files: {
                    'build/telekinesis.min.js': ['build/telekinesis.js']
                }
            }
        },

        watch: {
            concat: {
                files: ['src/**/*.js'],
                tasks: 'concat'
            }
        }
    })

    // Load necessary plugins
    grunt.loadNpmTasks( 'grunt-contrib-concat' )
    grunt.loadNpmTasks( 'grunt-contrib-uglify' )
    grunt.loadNpmTasks( 'grunt-contrib-jshint' )
    grunt.loadNpmTasks( 'grunt-contrib-watch' )

    grunt.registerTask( 'default', [ 'jshint', 'concat', 'uglify' ] )

}
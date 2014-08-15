module.exports = function(grunt) {
	
	grunt.log.write('Beginning build process...');
	
	// Configure Grunt
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			options: {
				force: true
			},
			release: ['build']
		},
		copy: {
			main: {
				options: {},
				files: [
					// Config XML
					{
						expand: true,
						cwd: './',
						src: ['*.xml'],
						dest: 'build'
					},
					// CSS
					{
						expand: true,
						cwd: 'src/css',
						src: ['**'],
						dest: 'build/css',
						filter: function(filepath) {
							return filepath.match(/\.css|\.min.css/);
						}
					},
					// Images
					{
						expand: true,
						cwd: 'src/img',
						src: ['**'],
						dest: 'build/img',
						filter: function(filepath) {
							return filepath.match(/\.jpg|\.png|\.gif|\.svg/);
						}
					},
					// JS
					{
						expand: true,
						cwd: 'src/js',
						src: ['**'],
						dest: 'build/js',
						filter: function(filepath) {
							return filepath.match(/\.js|\.min.js/);
						}
					}
				]
			}
		},
		uglify: {
			core: {
				options: {
					mangle: true,
					compress: true
				},
				files: [{
					expand: true,
					cwd: 'build/js/lib',
					src: '**/*.js',
					dest: 'build/js/lib'
				}]
			},
			packages: {
				options: {
					mangle: false
				},
				files: {
					'build/js/packages/async.js': 			['src/packages/async/lib/async.js'],
					'build/js/packages/backbone.js': 		['src/packages/backbone/backbone.js'],
					'build/js/packages/jquery.js': 			['src/packages/jquery/dist/jquery.js'],
					'build/js/packages/moment.js': 			['src/packages/moment/moment.js'],
					'build/js/packages/underscore.js': 		['src/packages/underscore/underscore.js'],
					'build/js/packages/velocity.js': 		['src/packages/velocity/jquery.velocity.js']
				}
			}
		},
		jade: {
			compile: {
				options: {
					data: {
						debug: false
					}
				},
				files: {
					'build/index.html': ['src/templates/index.jade']
				}
			}
		},
		less: {
			development: {
				options: {
					paths: ['src/css'],
					compress: true
				},
				files: {
					'build/css/app.css': 'src/css/app.less'
				}
			}
		},
		relativeRoot: {
			www: {
				options: {
					root: 'build'
				},
				files: [{
					expand: true,
					cwd: 'build',
					src: ['**'],
					dest: 'build',
					filter: function(filepath) {
						return filepath.match(/.html|.min.css/).length;
					}
				}]
			}
		},
		watch: {
			scripts: {
				options: {},
				files: [
					'gruntfile.js',
					'config.xml',
					'src/**/*.jade',
					'src/**/*.less',
					'src/**/*.js'
				],
				tasks: ['copy', 'uglify:core', 'jade', 'less', 'relativeRoot'] // Does not include 'watch' which would spawn additional grunt processes
			}
		}
	});
	
	// Load modules to run
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-relative-root');
	grunt.loadNpmTasks('grunt-contrib-watch');
	
	// Set tasks to run
	grunt.registerTask('nuclear', ['clean']);
	grunt.registerTask('packages', ['uglify:packages']);
	grunt.registerTask('build', ['copy', 'uglify', 'jade', 'less', 'relativeRoot', 'watch']);
	grunt.registerTask('all', ['clean', 'uglify:packages', 'copy', 'uglify:core', 'jade', 'less', 'relativeRoot']);
	
};

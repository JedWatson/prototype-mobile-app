var app = require('../lib/framework/app'),
	View = require('../lib/framework/view');

new View('home', {
	
	on: {
		init: function() {
			
			// you can do stuff here
			
		},
		layout: function() {
			
			// do layout stuff here
			
		},
		visible: function() {
			
			app.on('stuffChanged', function() {
				// init the view here
				if (app.hasStuff) {
					this.$('#btn-about').show();
					this.$('#btn-setup').hide();
				} else {
					this.$('#btn-about').hide();
					this.$('#btn-setup').show();
				}
			}.bind(this));
			
		},
		hidden: function() {}
	},
	
	buttons: {
		'#btn-about': 'gotoAbout',
		'#btn-setup': 'gotoSetup',
		'#btn-toggle': 'doStuff'
	},
	
	doStuff: function() {
		app.hasStuff = !(app.hasStuff);
		app.trigger('stuffChanged');
	},
	
	gotoAbout: function() {
		app.view('about').show('slide-up');
	},
	
	gotoSetup: function() {
		app.view('setup').show('slide-down');
	}
	
});

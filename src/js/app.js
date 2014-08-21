var $ = require('jquery'),
	moment = require('moment'),
	app = require('./lib/framework/app');

// Config Moment

moment.locale('en', {
	relativeTime: {
		future: 'in %s',
		past: '%s ago',
		s: 'seconds',
		m: '1 minute',
		mm: '%d minutes',
		h: '1 hour',
		hh: '%d hours',
		d: '1 day',
		dd: '%d days',
		M: '1 month',
		MM: '%d months',
		y: '1 year',
		yy: '%d years'
	}
});

// Initialise App

require('./views/about');
require('./views/home');
require('./views/setup');

app.on('init', function() {
	app.view('home').show();
});

$(function() {
	// console.log( '[root] - App running locally...' );
	app._local = true;
	if (!/(iphone)|(ipad)|(android)/i.test(navigator.userAgent) ) {
		// console.log( '[root] - Detected non-mobile device, initalising app...' );
		app.init();
	} else {
		console.log( '[root] - Detected mobile device, setting device ready event...' );
		$(document).on('deviceready', function() {
			navigator.splashscreen && navigator.splashscreen.hide && navigator.splashscreen.hide();
			// console.log( '[root] - Mobile device is ready...' );
			// console.log( '[root] - Triggering app init.' );
			app.init();
		});
	}
});

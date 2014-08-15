//	Index
//	=====
//
//	This is the main init script, which configures the application.
//	It should be the last script included.

_.extend(app.data, {
	
	version: '1.0.0', // Current app version, compared against config we get back from the server
	
	config: {}, // Example store for Application Config, this is totally customisable
	
});

_.extend(app, {
	
	exampleMethod: function() {
	
		// common logic here
	
	}
	
});

app.on('init', function() {
	
	app.view('home').show();
	
});

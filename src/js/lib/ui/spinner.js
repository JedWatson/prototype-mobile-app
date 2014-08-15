// Spinners
// --------

// Implements css3-based spinners that you can start and stop.
// Elements are dynamically added and removed on start/stop so that the animation
// isn't constantly running in the background when not required.

;(function() {
	
	// Spinner Definition
	// =================
		
	$.fn.spinner = function(option) {
		return this.each(function() {
			var $this = $(this),
				instance = $this.data('spinner');
			if (!instance) $this.data('spinner', (instance = new Spinner(this)));
			if (typeof option == 'string' && instance[option]) instance[option]();
		});
	};

	$.fn.spinner.Constructor = Spinner;
	
	// Spinner Class
	// ============
	
	var Spinner = function(el) {
		this.$el = $(el);
	}
	
	_.extend(Spinner.prototype, {
		
		// Starts the spinner
		start: function() {
			this.running = true;
			this.$el.html(
				'<div class="bar1"></div>' +
				'<div class="bar2"></div>' +
				'<div class="bar3"></div>' +
				'<div class="bar4"></div>' +
				'<div class="bar5"></div>' +
				'<div class="bar6"></div>' +
				'<div class="bar7"></div>' +
				'<div class="bar8"></div>' +
				'<div class="bar9"></div>' +
				'<div class="bar10"></div>' +
				'<div class="bar11"></div>' +
				'<div class="bar12"></div>'
			);
		},
		
		// Stops the spinner
		stop: function() {
			this.running = false;
			this.$el.html('');
		}
		
	});
	
})();

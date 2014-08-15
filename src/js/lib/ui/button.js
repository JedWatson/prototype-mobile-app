// Buttons
// -------

// Implements a basic button that handles its states and responds to events.
// Listen to the 'press' event to perform the action.

;(function() {
	
	// Which events to use?
	var touchSupport = 'ontouchstart' in document.documentElement;
	
	
	// Button Definition
	// =================
		
	$.fn.button = function(options) {
		return this.each(function() {
			var $this = $(this),
				method = false,
				instance = $this.data('button');
			if (typeof options == 'string') {
				method = options;
				options = {};
			}
			if (!instance) $this.data('button', (instance = new Button(this, options)));
			if (method && instance[method]) instance[method]();
		});
	};

	$.fn.button.defaults = {};

	$.fn.button.Constructor = Button;
	
	// Button Class
	// ============
	
	var Button = function(el, options) {
		
		var self = this;
		
		this.$el = $(el);
		this.options = _.extend({}, $.fn.button.defaults, options);
		this.disabled = false;
		
		this.$el.on((touchSupport ? 'touchstart' : 'mousedown'), function() {
			if (self.disabled || self.pressed) return;
			self.pressed = true;
			//self.offset = $(this).offset(); // for detecting movement away from the button, see todo below
			setTimeout(function() { self.$el.addClass('pressed'); }, 0); // needs to be in a timeout or it messes with the touch event
		});
		
		var cancelPress = function() {
			self.pressed = false;
			setTimeout(function() { self.$el.removeClass('pressed'); }, 1); // needs to be in a timeout or it messes with the touch event
		}
		
		this.$el.on((touchSupport ? 'touchcancel' : 'mouseout'), function() {
			if (self.pressed) {
				cancelPress();
			}
		});
		
		this.$el.on((touchSupport ? 'touchend' : 'mouseup'), function() {
			if (self.disabled || !self.pressed) return;
			cancelPress();
			// moved to tap / click event - see below
			// setTimeout(function() { self.$el.trigger('press'); }, 1); // needs to be in a timeout or it messes with the touch event
		});
		
		// TODO: Since iOS has no touchleave event, ideally we should track touchmove and
		// compare the current position of the touch to the bounding size of the button,
		// cancelling the touch if the event goes too far away from it.
		//
		// In the meantime we are using the 'tap' event
		
		/*this.$el.on('touchmove', function(e) {
			console.log(self.offset.left + ' < ' + e.pageX + ' < ' + (self.offset.left + self.offset.width));
			console.log(self.offset.top + ' < ' + e.pageY + ' < ' + (self.offset.top + self.offset.height));
		});*/
		
		this.$el.on((touchSupport ? 'tap' : 'click'), function() {
			if (self.disabled) return;
			self.$el.trigger('press');
		});
		
	}
	
	_.extend(Button.prototype, {
		
		show: function() {
			this.$el.show();
		},
		hide: function() {
			this.$el.hide();
		},
		enable: function() {
			this.disabled = false;
			this.$el.removeClass('disabled');
		},
		disable: function() {
			this.disabled = true;
			this.$el.addClass('disabled');
		}
		
	});
	
})();

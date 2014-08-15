// View
// -------------

// Views are based on Backbone Views, with specific behaviours for use as
// screens in the app.
// 
// Supported events (`on` option):
// *	`init` - before the view is shown for the first time
// *	`layout` - before the view is shown, and when the viewport is resized
// *	`visible` - after the view becomes visible
// *	`hidden` - after the view becomes hidden

var View;

(function() {

// Cached regex to split keys for `delegate`. **MUST** be the same as Backbone's.
var delegateEventSplitter = /^(\S+)\s*(.*)$/;

// Make backbone views default touch events to mouse events if there is no touch support
if (!app.touchSupport) {
	var delegateEvents = Backbone.View.prototype.delegateEvents;
	Backbone.View.prototype.delegateEvents = function(events) {
		if (!(events || (events = _.result(this, 'events')))) return this;
		var remappedEvents = {};
		for (var key in events) {
			var match = key.match(delegateEventSplitter);
			var eventName = match[1], selector = match[2];
			if (eventName in app.touchEventEquivalents) {
				eventName = app.touchEventEquivalents[eventName];
			}
			remappedEvents[eventName + (selector ? ' ' + selector : '')] = events[key];
		}
		delegateEvents.call(this, remappedEvents);
	}
}

View = function(id, options) {
	
	this.id = id;
	this.uniqueId = _.uniqueId('view');
	this.$el = $('#view-' + id);
	this.el = this.$el[0];
	
	this._configure(options);
	this.initialize.apply(this, arguments);
	app._views[id] = this;
	
};

_.extend(View.prototype, Backbone.Events, {
	
	// jQuery delegate for element lookup, scoped to DOM elements within the
	// current view. This should be prefered to global lookups where possible.
	$: function(selector) {
		return this.$el.find(selector);
	},
	
	// helper for looking up fields by ID within the view
	field: function(id) {
		return this.$('#view-' + this.id + '-field-' + id);
	},
		
	// Initialize is an empty function by default. Override it with your own
	// initialization logic.
	// NOTE that this method is fired when the view is constructed (i.e. on
	// page init). Use the on:init event to defer initialisation code to the
	// first time it is displayed.
	initialize: function(){},
	
	// Performs the initial configuration of a View with a set of options.
	_configure: function(options) {
		options = options || {};
		_.extend(this, _.omit(options, ['events','on']));
		this.on(options.on || {});
		
		var initialised = false;
		
		// Prepare the view to be shown for the first time
		// Triggers the init event if it has not already been triggered
		this.prepare = function() {
			
			if (initialised) return;
			initialised = true;
			
			if (options.events)
				this.delegateEvents(options.events);
			
			if (options.buttons)
				this.initButtons(options.buttons);
			
			this.initTabs();
			
			this.initLists();
			
			this.initSwitchers();
			
			this.trigger('init');
			
		}
	},
	
	// Set callbacks, where `events` is a hash of
	//
	// *{"event selector": "callback"}*
	//
	//     {
	//       'mousedown .title':  'edit',
	//       'click .button':     'save'
	//       'click .open':       function(e) { ... }
	//     }
	//
	// pairs. Callbacks will be bound to the view, with `this` set properly.
	// Uses event delegation for efficiency.
	// Omitting the selector binds the event to `this.el`.
	// This only works for delegate-able events: not `focus`, `blur`, and
	// not `change`, `submit`, and `reset` in Internet Explorer.
	delegateEvents: function(events) {
		_.each(events, function(method, key) {
			if (!_.isFunction(method)) method = this[method];
			if (!method) return;

			var match = key.match(delegateEventSplitter);
			var eventName = match[1].replace(/\|/g, ' '), selector = match[2];
			
			// remap touch events to mouse events if there is no touch support
			if (!app.touchSupport && eventName in app.touchEventEquivalents)
				eventName = app.touchEventEquivalents[eventName];
			
			method = _.bind(method, this);
			var handler = function(e) {
				// stop events from being fired if the app is in transition
				if (app._inTransition) {
					return true;
				}
				method(e, this);
			};
			if (selector === '') {
				this.$el.on(eventName, handler);
			} else {
				this.$el.on(eventName, selector, handler);
			}
		}, this);
		return this;
	},
	
	// Set up buttons, where `buttons` is a hash of
	// 
	// *{"button selector": "callback"}*
	// 
	// The buttons will be initialised, and the callback provided will be
	// bound to the 'press' event.
	initButtons: function(buttons) {
		_.each(buttons, function(method, selector) {
			this.$(selector).button();
			if (!_.isFunction(method)) method = this[method];
			if (!method) return;
			
			method = _.bind(method, this);
			var handler = function(e) {
				// stop events from being fired if the app is in transition
				if (app._inTransition) {
					return true;
				}
				method(e, this);
			};
			this.$el.on('press', selector, handler);
			//this.$el.on('click', selector, handler);
		}, this);
		return this;
	},
	
	// Looks for tabs, and if found, initialises them.
	initTabs: function() {
		
		var self = this,
			tabs = this.$('.tabs .tab');
		
		if (!tabs.size())
			return;
		
		tabs.each(function() {
			$(this).button().on('press', function() {
				var selected = $(this).data('tab');
				// select this tab
				self.$('.tab').each(function() {
					var $tab = $(this);
					$tab[$tab.data('tab') == selected ? 'addClass' : 'removeClass']('selected');
				});
				// show the container, hide the rest
				self.$('.tab-content').each(function() {
					var $content = $(this);
					if ($content.data('tab') == selected) {
						$content.show();
						// scroll to the top of the container's parent
						var parent = $content.parent();
						if (parent.size())
							parent[0].scrollTop = 0;
					} else {
						$content.hide();
					}
				});
			});
		}).first().trigger('press');
		
		// make swipes on the title change the current tab
		this.$('.titlebar .title').on('swipeLeft', function() {
			self.$('.tab.selected').next().trigger('press');
		}).on('swipeRight', function() {
			self.$('.tab.selected').prev().trigger('press');
		});
	
	},
	
	// Looks for lists, and if found, initialises them (only handles styles at the moment)
	initLists: function() {
		
		var self = this,
			lists = this.$('.list .item');
		
		if (!lists.size())
			return;
		
		lists.each(function() {
			$(this).button().on('press', function() {
				var selected = $(this).data('item');
				// select this tab
				self.$('.item').each(function() {
					var $list = $(this);
					$list[$list.data('item') == selected ? 'addClass' : 'removeClass']('selected');
				});
			});
		});
		
	},
	
	// Looks for switchers, and if found, initialises them
	initSwitchers: function() {
	
		var switchers = this.$('.switcher');
		
		if (!switchers.size()) return;
		
		switchers.each(function() {
		
			var $switcher = $(this);
				$input = $switcher.find('input');
			
			if (!$input.length) {
				// console.log('Switchers require an supplimentary input field.', $switcher);
				return;
			}
			
			var $state = $('<div class="state">On</div>').appendTo($switcher);
			
			$('<div class="handle"></div>').appendTo($switcher);
			
			var toggle = function() {
				
				var on = $switcher.hasClass('on');
				
				$state.text(on ? 'Off' : 'On');
				
				$state.css('opacity', 0);
				$state.velocity({ opacity: 1 });
				
				setTimeout(function() {
					$switcher.removeClass('on off');
					$switcher.addClass(on ? 'off' : 'on');
				}, 0);
				
				$input.val(on ? 'no' : 'yes');
				
			}
			
			$switcher.on(app.touchSupport ? 'tap' : 'click', function() {
				return toggle();
			});
			
			$switcher.on('swipeRight', function() {
				if (!$switcher.hasClass('on')) return toggle();
			});
			
			$switcher.on('swipeLeft', function() {
				if ($switcher.hasClass('on')) return toggle();
			});
		
		});
	
	},
	
	// Whether the view is currently visible
	isVisible: function() {
		// console.log( 'Is Visible:', app.currentView() == this );
		return (app.currentView() == this);
	},
	
	// Show the view, optionally with an animation effect.
	// 
	// Animation options are `slide-up`, `slide-down`, `slide-left`, and `slide-right`
	show: function(anim, quick) {
		
		// console.log("[show] - view [" + this.id + "]:show(" + ( anim || '' ) + ")");
		
		if (app.inTransition() || this.isVisible()) {
			// console.log("[show] - view [" + this.id + "]:show() bailing, app.inTransition: " + app.inTransition() + ", this.isVisible: " + this.isVisible());
			return;
		}
		
		var self = this;
		
		this.prepare();
		
		// set the z-index so this view appears on top of the previous one
		this.setZ(app.nextViewZ());
		
		// prepare the view
		this.$el.show();
		this.trigger('visible');
		this.trigger('layout');
		
		if (anim) {
			
			var translateX = 0,
				translateY = 0;
			
			switch (anim) {
				case 'slide-up': translateY = app.viewportSize.height; break;
				case 'slide-down': translateY = -app.viewportSize.height; break;
				case 'slide-left': translateX = -app.viewportSize.width; break;
				case 'slide-right': translateX = app.viewportSize.width; break;
			}
			
			this.$el.css({
				transform: 'translateX(' + translateX + 'px) translateY(' + translateY + 'px)',
				// TODO: Check compatibility of this!!
				//'-webkit-transform': 'translateX(' + translateX + 'px) translateY(' + translateY + 'px)',
				opacity: 1
			});
			
			setTimeout(function() {
			
				self.$el.velocity({
					translateX: [0, translateX],
					translateY: [0, translateY]
				}, {
					duration: quick ? 300 : 500,
					easing: quick ? 'easeInOutSine' : 'easeOutExpo',
					complete: function() {
						// console.log("[show] - transition complete");
						app.currentView(self, true);
					}
				});
			
			}, 10);
			
		} else {
			this.$el.show();
			this.$el.css('opacity', 1);
			app.currentView(this, true);
		}
		
	},
	
	// `reveal` is like `show`, but switches up the effects so that the view is
	// revealed as if behind the current one (for navigating back, etc)
	// 
	// Supports the same animation options as `show` but the effect is applied
	// to the currently visible screen (if there is one)
	reveal: function(anim, quick) {
		
		// console.log("[reveal] - view [" + this.id + "]:reveal(" + ( anim || '' ) + ")");
		
		if (app.inTransition() || this.isVisible()) {
			// console.log("[reveal] - view [" + this.id + "]:reveal() bailing, app.inTransition: " + app.inTransition() + ", this.isVisible: " + this.isVisible());
			return;
		}
		
		var self = this,
			prevView = app.currentView();
		
		if (!prevView) return this.show();
		
		this.prepare();
		
		// set z-indexes so the current view appears on top of this one
		prevView.setZ(app.nextViewZ());
		this.setZ(app.lastViewZ());
		
		// prepare the view
		this.$el.show();
		this.trigger('visible');
		this.trigger('layout');
		
		if (anim) {
			
			// console.log("[reveal] - view [" + this.id + "]:reveal starting animation");
			
			var translateX = 0,
				translateY = 0;
			
			switch (anim) {
				case 'slide-up': translateY = -app.viewportSize.height; break;
				case 'slide-down': translateY = app.viewportSize.height; break;
				case 'slide-left': translateX = -app.viewportSize.width; break;
				case 'slide-right': translateX = app.viewportSize.width; break;
			}
			
			this.$el.css({
				transform: 'translateX(0px) translateY(0px)',
				// TODO: Check compatibility of this!!
				//'-webkit-transform': 'translateX(0px) translateY(0px)',
				opacity: 1
			});
			
			setTimeout(function() {
			
				prevView.$el.velocity({
					translateX: [translateX, 0],
					translateY: [translateY, 0]
				}, {
					duration: quick ? 300 : 400,
					easing: quick ? 'easeOutSine' : 'easeOutSine',
					complete: function() {
						
						// console.log("[reveal] - view [" + self.id + "]:reveal animation complete");
						app.currentView(self, true);
						
						// reset position of previous view
						prevView.$el.css({
							transform: 'translateX(0px) translateY(0px)',
							// TODO: Check compatibility of this!!
							//'-webkit-transform': 'translateX(0px) translateY(0px)',
							opacity: 0
						});
					
					}
				});
			
			}, 10);
			
		} else {
			this.$el.css('opacity', 1);
			this.trigger('visible');
			app.currentView(this, true);
		}
		
	},
	
	// Sets the z-index of the view
	setZ: function(z) {
		this.$el.css('z-index', z);
	},
	
	// Hides the current view
	hide: function() {
		
		var self = this;
		
		// console.log("[hide] - view [" + this.id + "]:hide()");
		
		app.hideKeyboard();
		
		app.scrollContainer(self);
		
		this.$el.hide();
		this.trigger('hidden');
		
	}
	
});

})();

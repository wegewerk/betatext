define( [   'text!templates/actionbar.html','models/actionbar','appConfig','eventDispatcher', 'console']
  ,function( BarTemplate,                    ActionbarModel,    AppConfig,  EventDispatcher,   console){

return Backbone.View.extend({

  template: _.template(BarTemplate),
  model: new ActionbarModel(),

  events: {
    "touchstart #btn-start": "startComment",
    "click #btn-start": "startComment",
    "click #btn-register": "register",
    "click #btn-logout": "logout",
    "click #btn-logo, #btn-name": "editUser"
  },

  initialize: function() {
    _.bindAll(this);
    this.theUser = this.options.theUser;
    this.model.set('User',this.options.theUser);
    this.model.bind('change',this.render,this);
    this.theUser.bind('change',this.render,this);
    EventDispatcher.on('comment:complete', this.endComment, this);
    EventDispatcher.on('user:arrived',this.render);

    if( AppConfig.readonly ) this.model.set('readonly',true); // rendert durch bind auf change
    else this.render();

    $(window).scroll( this.scrollHandler );
  },
  startComment: function() {
    if( this.model.get('commenting') || this.model.get('readonly') ) return;
    this.model.set('commenting',true);
    EventDispatcher.trigger('action:startComment');
  },
  endComment: function() {
    this.model.set('commenting',false);
  },

  logout: function() {
    EventDispatcher.trigger('user:logout');
  },
  register: function() {
    EventDispatcher.trigger('user:login');
  },
  editUser: function() {
    EventDispatcher.trigger('user:edit');
  },
  scrollHandler: function() {
    var actionBar = this.$el;
    if( !actionBar.data('homePos')  ) {
      actionBar.data('homePos', actionBar.offset().top  );
    }
    var isScrolledOut = ($(window).scrollTop()) > actionBar.data('homePos');
    if( isScrolledOut )  {
        actionBar.addClass('fixed');
    } else {
        actionBar.removeClass('fixed');
    }
  },

  render: function() {
    if( this.model.get('readonly') ) return this;
    this.$el.html(this.template(this.model.toJSON()));
    return this; // to enable chaining
  }

});

});
define( [   'views/textView' ,'text!templates/app.html','models/user',
            'views/actionBar','views/userView'         ,'views/pstepsView','views/tooltipView',
            'appConfig',      'eventDispatcher','console']
,function(  TextView,         AppTemplate,              User,
            ActionBar,        UserView,                 PstepsView,        TooltipView,
            AppConfig,        EventDispatcher,  console){

return Backbone.View.extend({

  template: _.template(AppTemplate),

  initialize: function() {
    _.bindAll(this);
    EventDispatcher.on('comment:complete', this.unblockUI, this);
    EventDispatcher.on('action:startComment', this.startComment, this);
    this.setElement(this.options.commentableText);

    if(this.$el.length ) {
      this.TextID =  'bbt-'+this.$('.csc-default').eq(0).attr('id');
      this.$el.attr('id',this.TextID);
      this.TextContent = $('#'+this.TextID).html();
      this.theUser = new User();
      this.userView = new UserView({model:this.theUser});
      this.render();
      this.textView = new TextView({
        el: this.$el.find('.textView').get(0),
        TextID:this.TextID,
        TextContentInitial: this.TextContent
      });
      if( AppConfig.readonly ) {
        this.$('.actionBar').remove();
      } else {
        this.actionBar = new ActionBar({
          el: this.$el.find('.actionBar').get(0),
          theUser:this.theUser
        });
      }
      this.processStepsView = new PstepsView({
        el: $('.processView').get(0),
        TextID:this.TextID
      });
      this.tooltipView = new TooltipView({
        el: this.$el.find('.processView').get(0),
        TextID:this.TextID
      });

    } else {
//      console.log( 'this page contains no editable text');
    }
  },
  startComment: function() {
    console.log('appView on action startComment');
    EventDispatcher.trigger('comment:unPinAll');
    setTimeout( this.textView.startComment,10);
  },

  render: function() {
    this.$el.html(this.template());
    return this; // to enable chaining

  }

});

});
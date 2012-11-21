define(  ['text!templates/processStep.html','appConfig','eventDispatcher','console']
,function(PstepItemTemplate,               AppConfig,  EventDispatcher , console ){

  return Backbone.View.extend({

    tagName:  "li",
    className: "pstepItem",
    events: {
      "mouseenter"            : 'showTooltip',
      "mouseleave"            : 'hideTooltip',
      "click .stepLink"       : 'linkAction',
      "click .close"          : 'linkActionClose',
      "click .lightbox-block" : 'linkActionClose',
      "click .lightbox-container" : 'contentClicked'
    },

    // Cache the template function for a single item.
    template: _.template(PstepItemTemplate),
    initialize: function( ) {
      _.bindAll(this);
      this.ttPaused=false;
    },
    showTooltip: function() {
      EventDispatcher.trigger('tooltip:show',{Content:this.$('.tooltipContent').html(),parentEl:this.$el});
    },

    hideTooltip: function(e) {
      EventDispatcher.trigger('tooltip:hide',e);
    },
    pauseTooltip: function() {
      this.ttPaused = true;
      this.hideTooltip();
    },
    resumeTooltip: function() {
      this.ttPaused=false;
    },

    linkAction: function() {
      var linkTarget = this.$('.stepLink').attr('href');
      if( !_.isEmpty( linkTarget) ) {
        EventDispatcher.trigger('tooltip:pause');
        this.$('.lightbox-block').show();
        // Inhalt nachladen: Bei Themenseiten aus #block_50_left
        // sonst aus #block_75_left
        this.$('.actionLink-Content').load(linkTarget+' #block_50_left, #block_75_left');
      }
      return false;
    },

    linkActionClose: function(){
        EventDispatcher.trigger('tooltip:resume');
        this.$('.lightbox-block').hide();
    },
    contentClicked: function(e) {
          e.stopPropagation();
    },
    render: function(isLast) {
      var tplData = this.model.toJSON();
      this.$el.html(this.template(tplData));
      if( this.model.get('IsPast') ) this.$el.addClass('pastStep');
      if( isLast ) this.$el.addClass('lastStep');
      return this;
    }

  });

});
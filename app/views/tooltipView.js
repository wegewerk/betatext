define(  ['text!templates/tooltip.html','appConfig','eventDispatcher','console']
,function(TooltipTemplate,             AppConfig,  EventDispatcher , console ){

  return Backbone.View.extend({
    // Cache the template function for a single item.
    template: _.template(TooltipTemplate),
    events: {
        'mouseleave' : 'hideTooltip'
    },
    initialize: function( ) {
      _.bindAll(this);
      this.setElement( $('<div class="bbt-tipContainer"></div>').appendTo('body') );
      this.ttPaused=false;

      EventDispatcher.on('tooltip:show',this.showTooltip,this);
      EventDispatcher.on('tooltip:hide',this.hideTooltip,this);
      EventDispatcher.on('tooltip:pause',this.pauseTooltip,this);
      EventDispatcher.on('tooltip:resume',this.resumeTooltip,this);
    },
    showTooltip: function(data) {
      if( this.ttPaused ) return;
      this.tipData = data;
      this.render();
      var off = this.tipData.parentEl.offset();
      this.$el.show();
      off.top -= this.$el.height()+15;
      off.left -= (this.$el.width()/2 - this.tipData.parentEl.width()/2);
      this.$el.offset(off);
    },
    hideTooltip: function(e) {
      // mouseout während über Tooltip ?
      if( e && $(e.toElement).parent('.bbt-tooltip').length) return;
      
      this.$el.hide();        
    },
    pauseTooltip: function() {
      this.ttPaused = true;
      this.hideTooltip();
    },
    resumeTooltip: function() {
      this.ttPaused=false;
    },

    render: function() {
      this.$el.html(this.template(this.tipData));
      this.$el.attr('class','bbt-tipContainer');
      if( this.tipData.className ) this.$el.addClass(this.tipData.className);
      return this;
    }

  });

});
define(  ['text!templates/commentItem.html','models/vote','appConfig','eventDispatcher','console']
,function(CommentItemTemplate,               Vote,         AppConfig,  EventDispatcher , console ){

  return Backbone.View.extend({

    tagName:  "li",
    className: "commentItem",
    events: {
      "click #comment-close"  : 'closeComment',
      "click #comment-save"   : 'saveComment',
      "click #comment-cancel" : 'cancelComment',
      "click #comment-like"   : 'likeComment',
      "click #comment-dislike": 'dislikeComment',
      "mouseenter"            : 'onHoverComment',
      "mouseleave"            : 'onUnhoverComment',
      "keydown  #new-comment" : 'charsLeft',
      "keyup    #new-comment" : 'charsLeft',
      "click .jump_newest"    : 'jumpToNewest',
      "mouseenter .user-verified": 'showTooltip',
      "mouseleave .user-verified" : 'hideTooltip'
    },

    // Cache the template function for a single item.
    template: _.template(CommentItemTemplate),
    stackOffset : { top: 0, bottom: 0 },
    initialize: function( ) {
      _.bindAll(this);
      this.textView = this.options.textView;
      this.homePos = 0;
      this.pintime = 0;
      // disable logging here
      console = _.clone(console);
      console.log=function(){};
      $(window).scroll( this.scrollHandler );
    },
    showTooltip: function() {
      EventDispatcher.trigger('tooltip:show',{
          Content:this.$('.tooltipContent').html(),
          parentEl:this.$('.user-verified'),
          className: 'user-tooltip'
        });
    },

    hideTooltip: function(e) {
      EventDispatcher.trigger('tooltip:hide',e);
    },
    closeComment: function() {
      console.log('close '+this.model.id);
      this.pinned = false;
      EventDispatcher.trigger('comment:userClose',this.model);
    },
    onHoverComment: function() {
      this.hover();
      EventDispatcher.trigger('range:show',this.model);
    },
    onUnhoverComment: function() {
      this.unhover();
      EventDispatcher.trigger('range:showall');
    },
    saveComment: function() {
      if( !this.charsLeft() ) return;
      this.blockUI();
      var commentText = this.$('#new-comment').val();
      this.model.save({ 'Content':commentText }, {wait:true, success: this.unblockUI } );
    },
    blockUI: function() {
        this.$('.blockui-shim').show();
    },
    unblockUI: function() {
        this.$('.blockui-shim').hide();
    },
    unhover: function() {
      this.$el.removeClass('hovering');
      this.scrollHandler();
    },
    hover: function() {
      this.$el.removeClass('hoverOffset');
      this.$el.addClass('hovering');
      this.scrollHandler();
      if( !this.pinned ) {
        this.$el.addClass('hoverOffset');
      }
    },
    display: function() {
      this.render();
      this.show();
    },
    hide: function() {
      this.$el.addClass('offscreen').attr('hidden','hidden');
    },
    show: function() {
      this.$el.removeClass('offscreen').removeAttr('hidden');
      this.$el.focus();
    },
    cancelComment: function() {
      EventDispatcher.trigger('comment:cancel',this.model);
      EventDispatcher.trigger('comment:complete');
      this.model.destroy();
    },
    charsLeft: function() {
      var commentText = this.$('#new-comment').val();
      var charsLeft = AppConfig.limits.commentLength.max - commentText.length;
      this.$('.comment-chars-status > *').hide();
      this.$("#comment-save").attr('disabled','disabled').addClass('disabled');
      if( commentText.length < AppConfig.limits.commentLength.min ) {
        this.$('.chars-under').show();
      } else {
        this.$('.comment-chars-left-value').text(Math.abs(charsLeft));
        if(charsLeft < 0 ) {
          this.$('.chars-over').show();
        } else {
          this.$("#comment-save").removeAttr('disabled').removeClass('disabled');
          this.$('.chars-left').show();
        }
      }
      return true;
    },
    likeComment: function() {
      EventDispatcher.trigger('user:login',{success:this._likeComment});
    },
    dislikeComment: function() {
      EventDispatcher.trigger('user:login',{success:this._dislikeComment});
    },
    _likeComment: function() {
      var vote = new Vote({
        CommentID: this.model.id,
        Value:1
      });
      console.log('vote '+vote.get('Value')+' for '+vote.get('CommentID'));

      vote.save({},{success:this.updateVotes});
    },
    _dislikeComment: function() {
      var vote = new Vote({
        CommentID: this.model.id,
        Value:-1
      });
      console.log('vote '+vote.get('Value')+' for '+vote.get('CommentID'));

      vote.save({},{success:this.updateVotes});
    },
    updateVotes: function(response) {
      this.model.set({ Likes: response.get('Likes')
                      ,Dislikes: response.get('Dislikes')
                      ,UserVote: response.get('UserVote')
                    });
      EventDispatcher.trigger('comment:updateVote',this.model);
    },
    pin: function( value ) {
      this.pinned = value;
      if( this.pinned ) {
        this.$el.removeClass('hoverOffset');
        this.pintime = + new Date(); // badass way to get a timestamp
      } else {
        this.$el.removeClass('hoverOffset');
        this.display();
        this.hide();
      }
    },
    setPosition: function( x ) {
      if( x == null ) return;
      if( x < 425 ) x = 425;
      this.homePos = x;
      this.$el.offset({top:x});
//      this.$el.css('top',x+'px');
//      this.scrollHandler();
      console.log( 'homePos for '+this.model.id+' '+x);
    },
    getOffsetTop: function() {
//      return this.$el.offset().top;
      return this.homePos;
    },
    getHeight: function() {
      return this.$el.height();
    },
    unsetNewest: function() {
        this.isNewest = false;
        this.$el.removeClass('newest');
    },
    jumpToNewest: function() {
      EventDispatcher.trigger("commentsView:scrollTo",this.model);
      return false;
    },
    setNewest: function() {
        this.isNewest = true;
        this.setPosition(425);
        this.$('.jump_newest').show();
        this.$el.addClass('newest');
    },
    scrollHandler: function() {
      if( this.$el.hasClass('offscreen')) return;
      var scrolledOutAt = "";
      var edgeOffsetBottom = 10 + this.stackOffset.bottom;
      var edgeOffsetTop = 150 + this.stackOffset.top;
      if ( $(window).height() < parseInt(this.homePos + this.$el.outerHeight() - Math.abs($(window).scrollTop()) + edgeOffsetBottom,10) ) {
          scrolledOutAt = "bottom";
      };
      if ( ($(window).scrollTop()) > this.homePos - edgeOffsetTop ) {
          scrolledOutAt = "top";
      };
      if (scrolledOutAt==="" || $.browser.msie) { // sorry msie user...
          this.$el.removeClass('fixed');
          this.$el.offset({top:this.homePos});
          this.scrolledOut=false;
      } else {
        this.$el.addClass('fixed');
        this.scrolledOut=true;
        if (scrolledOutAt==="bottom" ) {
            this.$el.css({top:$(window).height()-this.$el.outerHeight() - edgeOffsetBottom+'px'});
        }
        if (scrolledOutAt==="top" ) {
            this.$el.css({top:edgeOffsetTop+'px'});
        }
      }
    },
    // neuberechnen der Home-position
    // wird beim Rendern gebraucht (natürlich)
    // aber auch bei unHover um den Kommentar wieder auszurücken
    getHomePos: function() {
      var commentSelector = this.model.isNew() ? '.comment-new':'.comment-'+this.model.id;
      var commentRange = this.textView.$(commentSelector);
      var commentRangePos = commentRange.offset();
      if( commentRangePos != null) {
        return commentRangePos.top+commentRange.height()/2-this.$el.height()/2;
      }
      else return null
    },

    // bei ignoreScroll = true wird der Kommentar an der Stelle positioniert die die Textrange vorgibt.
    // wir verwendet von arrangeViews in commentsView um die wahre Reihenfolge der kommentare zu bestimmen.

    render: function(ignoreScroll) {
//      console.log('commentView::render '+this.model.id+(this.pinned?' pinned':' unpinned'));
      var tplData = this.model.toJSON();

      tplData.limits = AppConfig.limits;
      this.$el.html(this.template(tplData));
      this.$el.attr('id','comment-text-'+this.model.id);
      this.unblockUI();
      if( this.pinned ) {
        this.$('#comment-close').show();
        this.$el.addClass('pinned');
      } else {
        this.$('#comment-close').hide();
        this.$el.removeClass('pinned');
      }

      if( this.model.isNew() ) {
        this.$('.show').remove();
        this.charsLeft();
      } else {
        this.$('.edit').remove();
      }

      if( !ignoreScroll) this.scrollHandler();
      if( !this.model.isNew() && !this.pinned ) this.hide();
      this.setPosition( this.getHomePos() )
      if( this.isNewest ) this.setNewest();
      if( !ignoreScroll) this.scrollHandler();
      this.delegateEvents();

      return this; // wird von commentsView an die Kommentarspalte angehängt.
    }

  });

});
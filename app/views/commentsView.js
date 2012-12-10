define(  ['views/commentView', 'eventDispatcher', 'console'] ,function( CommentView,         EventDispatcher,   console ){

  return Backbone.View.extend({

    tagName:  "ul",
    className: "text_comment_list",


    initialize: function( ) {
      _.bindAll(this);
      this.textView = this.options.textView;
      this.commentsList = this.options.commentsList;
      this.commentsList.bind('all',this._eventproxy);

      this.commentViewStore = {}; // hier werden die commentviews gespeichert
      this.showNewest=true; // wird beim ersten commentClose auf false gesetzt
      this.safetyMargin = 10; // abstand der kommentare im Stack
      this.commenting = false; // true wenn neuer kommentar verfasst wird
	  this.topBoundary = 425; // Platz nach oben (inline Style)
	  this.topBoundaryWhileFixed = 150; 
      
      EventDispatcher.on('comment:show',this.onShowComment,   this);
      EventDispatcher.on('comment:hide',this.onHideComment,   this);
      EventDispatcher.on('comment:userClose',this.onUserCloseComment, this);
      EventDispatcher.on('comment:close',this.onCloseComment, this);

      EventDispatcher.on('comment:unPinAll',this.unPinAll,this);
      EventDispatcher.on('comment:pin',this.onPinComment,this);
      EventDispatcher.on('comment:togglePinning',this.onTogglePinning,this);
      EventDispatcher.on('comment:updateVote',this.onUpdateVote,this);
      EventDispatcher.on('comment:cancel',this.onCancelAddComment,this);
      EventDispatcher.on('comment:complete',this.onCommentComplete,this);
      EventDispatcher.on("commentsView:scrollTo",this.scrollTo,this);
      EventDispatcher.on('action:startComment',this.onStartComment,this);

      EventDispatcher.on('user:arrived',this.resetFirstrun,this);
      EventDispatcher.on('user:left', this.resetFirstrun, this);

    },
    _eventproxy: function( action ) { console.log('commentsList:'+action)},

    checkOverlap: function( currentView, otherView ) {
      if( currentView.pinned && otherView.pinned  ) {
        var myTop       = currentView.getOffsetTop();
        var otherTop    = otherView.getOffsetTop();

        var myBottom    = this.safetyMargin + currentView.getOffsetTop() + currentView.getHeight();
        var otherBottom = this.safetyMargin + otherView.getOffsetTop() + otherView.getHeight();

        var myHeight = myBottom - myTop;

        if( myTop < otherBottom && myTop >= otherTop ) {
          myTop = otherBottom;
        } else if (myBottom > otherTop && myBottom <= otherBottom) {
          myTop = otherTop - myHeight;
        }
        if( myTop < this.topBoundary ) myTop = this.topBoundary;
        if( myTop > this.topBoundary-1 ) {
          currentView.setPosition( myTop );        
        } else {
          otherView.setPosition( otherTop + myHeight );        
        }
      }
    },
    
    getPositionInStack: function( view ) {
      var m = this.safetyMargin;
      var offsetTop = _.reduce( this.commentViewStore, function( memo, otherView){
        if( otherView.model.id == view.model.id || !otherView.pinned ) return memo;
        return otherView.homePos < view.homePos ? memo + otherView.getHeight() + m : memo;
      },0);
      var offsetBottom = _.reduce( this.commentViewStore, function( memo, otherView){
        if( otherView.model.id == view.model.id || !otherView.pinned ) return memo;
        return otherView.homePos > view.homePos ? memo + otherView.getHeight() + m : memo;
      },0);

      view.stackOffset = { top: offsetTop, bottom: offsetBottom };
    },
    
    pinnedComments: function() {
      return _.filter( this.commentViewStore, function( view ) { return view.pinned });
    },
      // wenn mehr als 3 Kommentare offen -> den schliessen der am längsten geöffet ist
    closeLongestVisible: function() {
      if( _.size( this.pinnedComments() ) <= 3 ) return;
      var longestVisible = _.min( this.pinnedComments(), function(view) { return view.pintime} );
      console.log('mehr als 3 kommentare. schliesse '+longestVisible.model.id);
      EventDispatcher.trigger('comment:close',longestVisible.model);
    },
    
    arrangeViews: function() {
      // jeden comment rendern, um homePos zu aktualisieren
      _.invoke(this.pinnedComments(),'render',true);

      for( var iteration = 0; iteration <= this.pinnedComments().length; iteration++ ) {
        _.each(this.commentViewStore,function(currentView) {
          _.each(this.commentViewStore, function(otherView) {
            if( currentView.model.id != otherView.model.id )
              this.checkOverlap(currentView, otherView);
          },this);
        },this);
      }

      _.each(this.pinnedComments(),function(currentView) {
        this.getPositionInStack( currentView );
      },this);
      
      // call scrollHandler on each pinned comment
      _.invoke(this.pinnedComments(),'scrollHandler');
    },

    onShowComment: function(comment) {
      var view = this.getView(comment);
      if( !view.pinned ) {
        view.display();
        view.hover();
        if( $.browser.msie) this.arrangeViews(); // nasty msie!
      } else {
        view.onHoverComment();
      }
    },
    onHideComment: function(comment) {
      var view = this.getView(comment);
      if( !view.pinned ) view.hide();
      view.unhover();
      this.arrangeViews();
    },
    onStartComment:function() {
      this.commenting = true;
      this.unsetNewest();
    },
    resetFirstrun: function() {
      if( this.commenting || this.pinnedComments().length) return;
      this.showNewest=true;
    },
    unsetNewest: function() {
      if( !this.showNewest ) return;
      this.showNewest=false;
      _.invoke(this.commentViewStore,'unsetNewest');
      EventDispatcher.trigger('comment:close',this.newestComment);
      console.log('Kein Firstrun mehr!');
    },
    onCancelAddComment: function(comment) {
      this.commenting=false;
      if( comment ) {
        var view = this.getView( comment );
        this.commentViewStore = _.without(this.commentViewStore, view );
        this.render();        
      }
    },
    onCommentComplete: function() {
      this.commenting=false;
      this.unsetNewest();
      _.invoke(this.commentViewStore,'unsetNewest');
    },
    onUserCloseComment: function(comment) {
      this.unsetNewest();
      this.onCloseComment(comment);
      _.invoke(this.commentViewStore,'unsetNewest');
    },
    onCloseComment: function(comment ) {
      var view = this.getView( comment );
      view.pin( false );
      view.hide();
      EventDispatcher.trigger('comment:hide',comment);
      this.arrangeViews();
    },
    onPinComment: function(comment) {
      var view = this.getView(comment);
      view.pin( true );
      view.display();
      this.closeLongestVisible();
      this.arrangeViews();
    },
    onTogglePinning: function( comment ) {
      var view = this.getView( comment );
      view.pin( !view.pinned );
      view.display();
      view.pin( view.pinned );
      if( view.pinned ) {
        this.closeLongestVisible();
        this.unsetNewest();
      }
      this.arrangeViews();
    },
    unPinAll: function() {
      _.each(this.pinnedComments(),function(view){ this.onCloseComment(view.model); },this);
    },
    scrollTo: function(comment) {
      this.unsetNewest();
      view = this.getView(comment);
      view.display();
      EventDispatcher.trigger('comment:pin',comment);
      EventDispatcher.trigger('range:showall');

      console.log('el.top: '+view.$el.offset().top);


      $('html, body').animate({
          scrollTop: view.getHomePos()-200
      });
    },
    onUpdateVote: function(comment){
      var view = this.getView( comment );
      view.display();
      this.arrangeViews();
      console.log('update after vote complete');
    },
    firstRun: function() {
      if( !this.showNewest ) return;
      console.log('Firstrun!');

      var comment = this.commentsList.max(function(comment) { return comment.get('ctime'); } );
      if( !_.isUndefined( comment )) {
        EventDispatcher.trigger('comment:pin',comment);
        EventDispatcher.trigger('range:showall');
        this.newestComment = comment;
        this.getView( comment ).setNewest();        
      }
    },
    hasComments: function() {
      return _.size( this.commentViewStore );
    },
    getView: function(comment) {
      var view = this.commentViewStore[comment.cid];
      if( _.isUndefined( view ) && !_.isUndefined(comment.id ) ) {
        view = _.find(this.commentViewStore, function(view){
          return view.model.id === comment.id;
        });
      }
      
      if( _.isUndefined( view ) ) {
        view = new CommentView({model:comment,textView:this.textView});
        this.commentViewStore[comment.cid] = view;
        console.log('created new view for '+comment.cid+"("+comment.id+")");
      }
      view.model=comment;
      return view;
    },

    renderComment: function(comment){
      var view;
      view = this.getView( comment );

      this.$el.append(view.render().el);
      if(comment.isNew()) {
        view.pin(true);
        view.scrollHandler();
        view.$('#new-comment').focus();
      } 
    },

    render: function() {
//      EventDispatcher.trigger('comment:unPinAll');
      this.$el.empty();
      this.commentsList.each(this.renderComment);
      return this;
    }
  });

});
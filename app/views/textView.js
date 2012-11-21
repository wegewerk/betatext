define( [ 'models/text','models/comment',
          'text!templates/textItem.html','text!templates/footnote.html',
          'views/commentsView',
          'appConfig',  'eventDispatcher', 'console']

,function( TextModel,    CommentModel,
           TextItemTemplate,              FootnoteTemplate,
           CommentsView,
           AppConfig,    EventDispatcher ,  console){

  return Backbone.View.extend({

    tagName:  "div",
    events: {
      "click #createCommentButton": "createComment",
      "touchstart #createCommentButton": "createComment",
      "click #cancelCommentButton": "startCommentBack"
    },

    // Cache the template function for a single item.
    template: _.template(TextItemTemplate),
    footnoteTemplate : _.template(FootnoteTemplate),

    // true wenn Text so gespeichert werden soll
    // heisst: footnotes werden nur gerendert wenn editmode == false
    editMode: false,

    initialize: function( ) {
      _.bindAll(this);
      this.model = new TextModel({'TextID':this.options.TextID}),
      this._text_sent=false;
      this._events_bound=false;

      // holen des Textes vom Server
      // im Fehlerfall Textobjekt an Server senden
      // Die Changeevents des Models können erst an die renderfunktion gebunden werden, wenn das Model text enthält
      // entweder vom Server oder options.TextContentInitial (initialer Fall)
      this.model.fetch({ 
          error:this.sendTextInitial
          ,success:this.onTextReceived
      });

      EventDispatcher.on('comment:show',this.onShowComment,this);
      EventDispatcher.on('comment:hide',this.onHideComment,this);
      EventDispatcher.on('comment:cancel',this.cancelAddComment,this);
      EventDispatcher.on('comment:updateVote',this.renderFootnote,this);
      EventDispatcher.on('comment:complete',this.onCommentComplete,this);
      EventDispatcher.on('comments:arrived',this.renderComments,this);

      EventDispatcher.on('user:arrived',this.receiveUser,this);
      EventDispatcher.on('user:left', this.kickUser, this);

      EventDispatcher.on('range:show',this.onShowComment,this);
      EventDispatcher.on('range:showall',this.onShowAllRanges,this);
    },

    bindChangeEvents: function () {
      if( this._events_bound ) return;
      this.model.bind('change', this.render, this);
      this.model.comments.bind('reset', this.render, this);
      this.model.comments.bind('add', this.renderComments, this);
      this.model.comments.bind('destroy', this.render,this);

      this.commentsView = new CommentsView({commentsList:this.model.comments,textView:this});
      this._events_bound=true;
    },

    receiveUser: function(user) {
      console.log('All hail to the User!');
      this.User = user;
      if( this._text_sent ) {
        console.log('Text already sent.')
        this.model.comments.fetch({success:this.render});
      } else {
        console.log('sending initial text');
        this.model.fetch({ 
            error:this.sendTextInitial
            ,success:this.onTextReceived
        });
      }

    },
    kickUser: function(user) {
      this.User = user;
      EventDispatcher.trigger('comment:cancel');
      EventDispatcher.trigger('comment:complete');
      console.log('The User has left the App!');
      this.model.comments.fetch({success:this.render});
    },
    onTextReceived: function() {
      this._text_sent=true;
      this.bindChangeEvents();
      this.render();
    },

    // Fehlerfall von fetch Text (in initialize)
    // checken ob User eingeloggt
    sendTextInitial: function() {
      EventDispatcher.trigger('user:check',{success:this._sendTextInitial,error:this._startWithOriginalText});
    },

    // user eingeloggt, Text initial schicken
    _sendTextInitial: function() {
      this._text_sent=true;
      this.bindChangeEvents();
      this.model.set('Content', this.options.TextContentInitial);
      this.model.set('Version', 1);
      this.model.save();
    },

    // User nicht eingeloggt, mit vorhandenem Text auf der Seite starten
    _startWithOriginalText: function() {
      console.log('not sending text, not logged in');
      this._text_sent=false;
      this.bindChangeEvents();
      this.model.set('Content', this.options.TextContentInitial);
      this.model.set('Version', 1);
    },

    onShowComment: function(comment) {
      this.$('.savedComment').removeClass('current');
      this.$('.comment-'+comment.id).addClass('current');
    },

    onShowAllRanges: function() {
      _.each(this.commentsView.pinnedComments(), function(view){
        this.$('.comment-'+view.model.id).addClass('current');
      },this);
    },
    onHideComment: function(comment) {
      if( !comment.pinned ) {
        this.$('.comment-'+comment.id).removeClass('current');
      }
      this.onShowAllRanges();
    },
    // Nutzerführung anzeigen
    startComment: function() {
      this.$('.error').hide();
      this.creatingComment = true;
      EventDispatcher.trigger('user:login',{success:this._startComment,error:this.startCommentBack});
    },
    _startComment: function() {
      this.$('.comment_ui').show();
      this.unblockUI();        
      var sel = rangy.getSelection();
      if( !_.isUndefined(sel) && ! sel.isCollapsed ) this.createComment();
    },
    // User hat 'zurück' geklickt
    startCommentBack: function() {
      this.$('.comment_ui').hide();
      EventDispatcher.trigger('comment:complete');      
      this.renderFootnotes();      
    },
    blockUI: function() {
        this.$('.blockui-shim').show();
    },
    unblockUI: function() {
        this.$('.blockui-shim').hide();
    },
    // User hat 'speichern' geklickt
    createComment: function() {
      this.blockUI();
      this.removeFootnotes();
      this.editMode = true;
      this.creatingComment = false;
      setTimeout(this._createComment,10);
    },
    _createComment: function(){
      // selection holen und überprüfen
      // setzt this.charSelection und this.currentSelection
      setTimeout( this.$('.comment_ui').hide, 10 );
      this.getSelection();

      if( this.charSelection ) {
        var comment = new CommentModel({
          StartIndex:    this.charSelection.range.start,
          EndIndex:      this.charSelection.range.end,
          TextID:        this.model.id,
          CommentedText: this.currentSelection.getRangeAt(0).toString(),
          User: this.User.toJSON()
        });
        this.renderCommentRange(comment);
        this.commentsView.renderComment(comment);
        comment.bind('change', this.addComment,this);
      } else {
        this.$('.comment_ui').show();
        this.$('#error_selection').show();

        this.unblockUI();
        this.renderFootnotes();      
      }
    },
    getSelection: function( ) {
      this.currentSelection = rangy.getSelection();
      this.charSelection = null;

      // Leere Selection ist unbrauchbar
      if( this.currentSelection.isCollapsed ) return;

      // Der Anfang der Selection muss auf jeden Fall im Text liegen
      if( !$(this.currentSelection.anchorNode).parents('.commented_text').length ) return;

      var end_ok = $(this.currentSelection.focusNode).parents('.commented_text').length;
      var expandSelection = true; // falls selection-ende korrigiert werden muss, nicht mehr den wordselektor anwenden
      if( !end_ok ) {
      var range = this.currentSelection.getRangeAt(0);
        if( this.currentSelection.isBackwards() ) {
          console.log('correcting selection start');
          range.setStartBefore( this.$('.commented_text').get(0) );
        } else {
          console.log('correcting selection end');
          range.setEndAfter( this.$('.content_bodytext').get(0) );
          expandSelection = false;
        }
        this.currentSelection.removeAllRanges();
        this.currentSelection.addRange(range);
      }

      if(expandSelection) {
        this.currentSelection.expand("word", {
          wordRegex: AppConfig.wordRegex
        });        
      }

      this.charSelection = this.currentSelection.saveCharacterRanges(this.el);
      if( this.charSelection ) {
        this.charSelection = this.charSelection[0]
      } else {
        this.currentSelection.detach();
      }
    },

    cancelAddComment: function(){
      this._removeNewCommentSpan();
      this.editMode = false;
      this.creatingComment = false;
      this.saveContentToModel(); // impliziert render()
    },

    // löscht temporären span aus Text, setzt endgültige Markierung rein
    // und speichert TextModel
    addComment: function(comment) {
      this._removeNewCommentSpan();
      this.model.comments.add(comment);
      this.renderCommentRange(comment);
      // speichern des Kommentars den wir in den Text rendern wollen
      // als lokale Variable, um im Fehlerfall darauf zugriff zu haben
      this.currentComment = comment;
      this.model.save({'CommentID':comment.id},{error:this.onTextsaveError,success:this.onTextsaveSuccess});
    },

    _removeNewCommentSpan: function() {
      this.$('.savedComment').removeClass('comment-new');
      this.$('.comment-new').replaceWith(function() {
        return $(this).contents();
      });
    },

    onTextsaveError: function(model,response){
      console.log('text save error');
      var newModel = JSON.parse(response.responseText);
      // auf 409 Conflict prüfen
      if( response.status == 409) {
        console.log('got version '+newModel.Version);
        console.log('have version '+this.model.get('Version'));
        EventDispatcher.trigger('comment:saveConflict');
        // aktuelle Version des Textes rendern
        // triggert change-event und damit render()
        this.model.set({'Version': newModel.Version
                       ,'Content': newModel.Content});

        // aktuelle liste der Kommentare holen
        // der aktuelle Kommentar ist da mit drin
        this.model.comments.fetch({success:this.textResave});
      }
      if( response.status == 401) {
        EventDispatcher.trigger('login:userExpected');
      }
    },
    textResave: function() {
        // und wieder versuchen zu speichern
        console.log('versuche Text neu zu speichern');
        this.renderCommentRange(this.currentComment);
        this.model.save({},{error:this.onTextsaveError,success:this.onTextsaveSuccess});
    },
    onTextsaveComplete: function() {
      console.log('Text save Complete');
      EventDispatcher.trigger('comment:complete');
      var commentView = this.commentsView.getView(this.currentComment);
      EventDispatcher.trigger('comment:show', commentView.model);
      EventDispatcher.trigger('comment:pin', commentView.model);

      delete this.currentComment;
    },
    onTextsaveSuccess: function(model,response){
      console.log('text save success');
      this.editMode = false;
      this.model.comments.fetch({success:this.onTextsaveComplete});
    },
    // Eventhandler für 'Kommentar erstellen fertig.' setzt eigentlich nur this.creatingComment = false
    // kann aber (über den event) auch von aussen aufgerufen werden
    onCommentComplete: function() {
      this.creatingComment = false;
    },
    removeFootnotes: function() {
      this.$('.footnote').remove();
    },

    renderFootnotes: function() {
      console.log('render footnotes');
      this.model.comments.each(this.renderFootnote);
    },

    renderFootnote: function(comment) {
      var footnote = $( this.footnoteTemplate(comment.toJSON() ) )
      footnote.mouseenter(function(){
        EventDispatcher.trigger('comment:show',comment);
      })
      footnote.mouseleave(function(){
        EventDispatcher.trigger('comment:hide',comment);
      })
      footnote.click(function(e){
        console.log('footnote.click '+comment.id);
        if( e.target == this ) {
          EventDispatcher.trigger('comment:togglePinning',comment);
        } 
      })
      $('a',footnote).click(function(e){
        console.log('footnote.a.click '+comment.id);
        if( e.target == this ) {
          EventDispatcher.trigger('comment:togglePinning',comment);
          e.stopPropagation();
          return false;
        }
      })

      this.$('#footnote-comment-'+comment.id).remove();
      this.$('.comment-'+comment.id).last().append(footnote);

    },

    // alle Ranges im Text durchgehen und prüfen, ob in this.model.comments enthalten.
    // wenn nicht: rauslöschen. Nicht gleich speichern, das ist nur für die Anzeige
    // beim Erstellen eines neuen Kommentars wird diese Funktion auch aufgerufen, was dann bewirkt, dass die
    // neue Version des Textes die gelöschen Kommentare nicht mehr enthält
    removeDeletedRanges: function() {
      console.log('remove deleted ranges');
      var textView = this;
      this.$('.savedComment').each(function(){
        var commentClasses = $(this).attr('class').split(' ');
        var IDClass = _.filter(commentClasses,function(klass) { return klass.match(/^comment-/); });
        if( IDClass.length == 1 ) {
          commentID = IDClass[0].replace(/^comment-/,'');
          if( commentID != 'new') {
            if( textView.model.comments.get(commentID) ) {
//              console.log(commentID +' still visible.')
            } else {
//              console.log(commentID +' deleted.')
              textView.$('.comment-'+commentID).replaceWith(function() {
                return $(this).contents();
              });
            }
          } 
        }
      });
    },

    render: function() {
      if( !this.model.get('Content')) return this;
      this.$el.html(this.template(this.model.toJSON()));
      this.$('.comment_ui').hide();
      this.removeDeletedRanges();
      this.renderComments();
      if( this.creatingComment ) {
        this.startComment();
      }
      $('body *').addClass('unselectable').attr('unselectable','on');
      this.$('.selectable *').removeAttr('unselectable').removeClass('unselectable');

      return this; // to enable chaining
    },

    renderComments: function() {
      if( !this.commentsView ) return; // wenn die kommentare zu früh ankommen, gibts noch keine commentsView
      this.$('.text_comments').empty();
      this.$('.text_comments').append(this.commentsView.render().el);
      if( !this.editMode ) {
        this.renderFootnotes();
        this.commentsView.firstRun();
      }
    },

    renderCommentRange: function(comment){
      var start = comment.get('StartIndex'),
          end   = comment.get('EndIndex'),
          sel = rangy.getSelection(),
          comment_class = comment.isNew() ? 'comment-new' : 'savedComment comment-'+comment.id;

        if( sel ) {
          sel.selectCharacters(this.el, start, end );
          rangeApplier = rangy.createCssClassApplier(comment_class,{normalize:true});
          rangeApplier.applyToSelection();
          rangy.getSelection().removeAllRanges();
          this.saveContentToModel();
        }
    },

    // Text aus DOM holen und ins model speichern
    saveContentToModel: function() {
      var newContent = $('.commented_text',$('#'+this.model.get('TextID')) ).html();
      this.model.set('Content', newContent); // triggert 'change' im model -> render() wird aufgerufen
    }
  });

});
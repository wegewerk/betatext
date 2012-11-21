define( [ 'models/user',
          'text!templates/loginForm.html',
          'appConfig',  'eventDispatcher', 'console']

,function( User,
           LoginFormTemplate,
           AppConfig,    EventDispatcher ,  console){

    return Backbone.View.extend({


        events: {
          "keypress input.text"     : "sendOnEnter",
          "click #submitLoginButton": "checkCredentials",
          "click #cancelLoginButton": "cancelLogin",
          "click .lightbox-block"   : "cancelLogin",
          "click .close"            : "cancelLogin"

        },
        template: _.template(LoginFormTemplate),
        loginCallbacks: {},

        initialize: function() {
          _.bindAll(this);
          this.setElement($('<div></div>').appendTo('body').hide().get(0));
          this.model.fetch({success:this.fetchSuccess,error:this.fetchError});
          EventDispatcher.on('user:login',this.getLogin,this);
          EventDispatcher.on('user:check',this.checkLogin,this);
          EventDispatcher.on('user:logout',this.logout,this);
          EventDispatcher.on('user:edit',this.edit,this);
        },
        fetchSuccess: function(userModel,response) {
          this.model.set('_logged_in',true);
          console.log('The User has arrived!');
          EventDispatcher.trigger('user:arrived',this.model);
          if( this.loginCallbacks && this.loginCallbacks.success ) this.loginCallbacks.success.call();
        },
        fetchError: function(userModel,response) {
          if( response.status == 404 ) {
            console.log('User ist nicht eingeloggt');
            this.model.set('_logged_in', false);
            var parsedResponse = JSON.parse(response.responseText);

            this.model.register_url = parsedResponse.register_url+'&returnto='+pageUID;
            this.model.pwreset_url = parsedResponse.pwreset_url+'&returnto='+pageUID;
          }
        },
        logged_in: function(){
            return this.model.get('_logged_in');
        },
        getLogin: function(callbacks) {
          if( this.logged_in() ) {
            if( callbacks && callbacks.success ) callbacks.success.call();
          } else {
              this.$el.html(this.template(this.model.toJSON()));
              this.$el.show();
              this.$('#bbt-user').focus();
              this.$('.waitingForCredentials').show();
              this.loginCallbacks = callbacks;
          }
          return this;
        },
        checkLogin: function(callbacks) {
            if( this.logged_in() && callbacks && callbacks.success ) callbacks.success.call();
            if( !this.logged_in() && callbacks && callbacks.error ) callbacks.error.call();
        },
        sendOnEnter: function(e) {
          if (e.keyCode == 13){
            if( this.$('#bbt-user').val() == "" ) this.$('#bbt-user').focus();
            else if( this.$('#bbt-pass').val() == "" ) this.$('#bbt-pass').focus();
            else this.checkCredentials();
          }
        },
        checkCredentials: function() {
            var login = this.$('#bbt-user').val();
            var pass  = this.$('#bbt-pass').val();
            this.$('.statusmessage').hide();
            this.$('.checkingCredentials').show();
            var data = JSON.stringify( { username:login,password:pass });
            $.post( AppConfig.REST.login, data,null,'json' )
             .success(this.loginSuccess)
             .error(this.loginError)
        },
        loginSuccess: function() {
          this.model.fetch({success:this.fetchSuccess,error:this.fetchError});
          this.$el.hide();
        },
        loginError: function() {
            this.$('.statusmessage').hide();
            this.$('.invalidCredentials').show();
        },
        cancelLogin: function(e) {
          if( e.target.className == 'lightbox-block' || e.target.className == 'close' || e.target.id == 'cancelLoginButton') {
            this.$el.hide();
            if( this.loginCallbacks && this.loginCallbacks.error ) this.loginCallbacks.error.call();
          }
        },
        edit: function() {
          window.location=this.model.get('profile_url')+'&returnto='+pageUID;
        },
        logout: function() {
            $.post( AppConfig.REST.logout, null,null,'json' )
             .success(this.logoutSuccess)
        },
        logoutSuccess: function(response) {
          this.model.kill();
          this.model.register_url = response.register_url;
          this.model.pwreset_url = response.pwreset_url;
          EventDispatcher.trigger('user:left',this.model);
//          location.reload();
        }

    });
});

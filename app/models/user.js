define( [ 'appConfig','eventDispatcher','console']
,function( AppConfig,  eventDispatcher,  console ) {

  return Backbone.Model.extend({
    defaults: function() {
      return {
        Name:'',
        Logo: '',
        Verified:0,
        _logged_in: false
      };
    },
    url: function() {
      console.log('user.url');
      return AppConfig.REST.url+'/user'+'?cachebust='+ Math.random();
    },
    pwreset_url: '',
    register_url: '',

    toJSON: function(options) {
      var attrs = _.clone(this.attributes);
      attrs.pwreset_url = this.pwreset_url;
      attrs.register_url = this.register_url;
      return attrs;
    },
    kill: function() {
      this.set(this.defaults());
    }

  });
});
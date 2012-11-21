define( [ 'appConfig','eventDispatcher','console']
,function( AppConfig,  eventDispatcher,  console ) {

  return Backbone.Model.extend({
    defaults: function() {
      return {
        commenting: false,
        logged_in: false,
        readonly:false
      };
    },
    toJSON: function(options) {
      var attrs = _.clone(this.attributes);
      attrs.User = this.get('User').toJSON();
      return attrs;
    },

  });
});
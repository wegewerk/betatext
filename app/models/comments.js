define(['models/comment','eventDispatcher','appConfig','console'],function(CommentModel,EventDispatcher,AppConfig,console){
return Backbone.Collection.extend({
    model: CommentModel,
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      var collection = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
          console.log('Comments have arrived!');
          EventDispatcher.trigger('comments:arrived',collection);
          if (success) success(collection, resp);
      };
      return Backbone.Collection.prototype.fetch.call(this,options);
    }
  });
});
define(['models/pstep','eventDispatcher','appConfig','console'],function(PstepModel,EventDispatcher,AppConfig,console){
return Backbone.Collection.extend({
    model: PstepModel,
    initialize: function(options) {
        this.url = options.url;
    }
  });
});
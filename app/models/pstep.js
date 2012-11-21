define(  ['appConfig','eventDispatcher']
,function( AppConfig,  EventDispatcher){

  return Backbone.Model.extend({
    urlRoot: AppConfig.REST.url+'/pstep',
    defaults: function() {
      return {
        TextID: 0,
        Content: "default step content",
        StepIndex: "0"
      };
    }
  });

});
define(  ['appConfig','eventDispatcher']
,function( AppConfig,  EventDispatcher){
  return Backbone.Model.extend({
    url: AppConfig.REST.url+'/vote'
  });
});
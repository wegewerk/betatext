define(['models/comments','appConfig'],function(CommentList,AppConfig){

  return Backbone.Model.extend({
    idAttribute: "TextID",
    urlRoot: AppConfig.REST.url+'/text',

    initialize: function() {
      this.comments = new CommentList;
      this.comments.url = 'rest.php/comments/'+this.id
      this.comments.fetch();
 }
  });
  
});
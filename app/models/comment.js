define(  ['appConfig','eventDispatcher']
,function( AppConfig,  EventDispatcher){

  return Backbone.Model.extend({
    urlRoot: AppConfig.REST.url+'/comment',
    defaults: function() {
      return {
        TextID: 0,
        Content: "default comment content",
        StartIndex:0,
        EndIndex:0,
        Likes:0,
        Dislikes:0,
        UserVote:0
      };
    },
    numVotes: function() {
      return this.get('Likes') + this.get('Dislikes');
    },
    // Farbskala:
    //    rot             grau           grün
    // +-----------|----|--|--|-----|----------+
    // |  1        | 2  |  3  |   4 |  5       |
    // +-----------|----|--|--|-----|----------+
    //            33   45 50 55    66
    getVoteClass: function() {
      var pctLikes = this.get('Likes') * 100 / this.numVotes();
      var level = 0;
      if( pctLikes <=33 ) level =1;
      if( pctLikes > 33 && pctLikes <=46 ) level =2;
      if( pctLikes > 46 && pctLikes <=56 ) level =3;
      if( pctLikes > 56 && pctLikes <=67 ) level =4;
      if( pctLikes > 67 ) level =5;
      return 'acceptanceLevel-'+level;
    },
    initialize: function () {
      _.bindAll(this);
      if (!this.get("content")) {
        this.set({"content": this.defaults.content});
      }
    },
    toJSON: function(options) {
      var attrs = _.clone(this.attributes);
      attrs.numVotes = this.numVotes();
      attrs.voteClass = this.getVoteClass();
      attrs.footnoteid = this.id || this.cid;
      return attrs;
    },

  });

});
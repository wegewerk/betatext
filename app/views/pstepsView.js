define(  ['views/pstepView','models/pstepList','text!templates/parl_process.html','appConfig','eventDispatcher', 'console'] ,
function(  PstepView,        PstepList,         PstepsTemplate,                    AppConfig , EventDispatcher,   console ){

  return Backbone.View.extend({
    template: _.template(PstepsTemplate),
    events: {
      "click .nextStep"            : 'scrollPrev',
      "click .prevStep"            : 'scrollNext'
    },

    initialize: function( ) {
      _.bindAll(this);
      this.TextID = this.options.TextID;
      this.pstepList = new PstepList({
        url : 'rest.php/psteps/'+this.TextID
      });

      this.pstepList.bind('reset',this.onStepsReceived);
      this.pstepList.fetch();
      
    },
    onStepsReceived: function() {
      var step = this.pstepList.where({IsCurrent:1})[0];
      this.currentStep = this.pstepList.indexOf(step);
      this.currentStep = this.checkBounds(this.currentStep-1);
      this.tplData = { ProcessTitle: step.get('ProcessTitle') };
      this.render();
      this.scrollTo( this.currentStep);
    },
    scrollTo: function( step ) {
      var scrollValue = this.checkBounds(step)*this.stepWidth;
      this.$('.processStepListContainer').animate({scrollLeft:scrollValue},500);
    },

    // es sind immer 5 Steps sichtbar, deshalb nie weiter scrollen
    checkBounds: function( step ) {
      this.$('.prevStep, .nextStep').removeClass('disabled');
      if( step >= this.pstepList.length-AppConfig.pstepsView.visibleSteps ){
        step = this.pstepList.length-AppConfig.pstepsView.visibleSteps;
        this.$('.prevStep').addClass('disabled');
      }
      if( step < 0 ){
        step = 0;
      }
      if( step == 0 ) this.$('.nextStep').addClass('disabled');

      // bei weniger als 6 schritten scrollpfeile verstecken
      if( this.pstepList.length<=5 ) this.$('.prevStep, .nextStep').addClass('not_shown');;
      return step;
    },
    scrollNext: function() {
      this.currentStep = this.checkBounds(this.currentStep + AppConfig.pstepsView.visibleSteps );
      this.scrollTo(this.currentStep);
      return false;
    },
    scrollPrev: function() {
      this.currentStep = this.checkBounds(this.currentStep - AppConfig.pstepsView.visibleSteps );
      this.scrollTo(this.currentStep);
      return false;
    },

    renderStep: function(step) {
      var view = new PstepView({model:step, tipContainer: this.tipContainer});
      var step = view.render(this.pstepList.last() == step);

      this.$('.processStepList').append( step.el );

      this.stepWidth = step.$el.outerWidth(true);
    },

    render: function() {
      this.$el.html(this.template(this.tplData));
      this.pstepList.each(this.renderStep);
      return this;
    }
  });

});
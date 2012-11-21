require.config({
    baseUrl: 'typo3conf/ext/ww_bbt/app',
    paths: {
    	text: '../lib/requirejs/text'
    }
});

// Start the main app logic.
require(['views/appView'],
  function (AppView) {
    // clean up page
    $('#themendossiers').remove();
	  rangy.init();
	  var App = new AppView({
          commentableText: $(".commentable_text").get(0)
      });
	}
);



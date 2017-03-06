
$(function() {
	requirejs.onError = function (err) {}

	require.config({
			baseUrl: 'typo3conf/ext/we_betatext/app',
			paths: {
				text: '../lib/requirejs/text'
			}
	});

	// wenn Tool aktiviert, dann auch noch Klasse im BODY
	if( bbt_enabled )
	{
		$('body').addClass('bbt_enabled')
		// UND body unselectierbar machen:
		.addClass('unselectable')
		// auch für den IE:
		.attr('unselectable', 'on');

	}

	// Start the main app logic.
	require(['views/appView'],
		function (AppView) {

			$(bbt_selector).wrapInner('<div class="commentable_text"></div>');
			rangy.init();
			var App = new AppView({
						commentableText: $(".commentable_text").get(0)
				});
		}
	);
});

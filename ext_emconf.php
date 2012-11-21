<?php

########################################################################
# Extension Manager/Repository config file for ext "ww_bbt".
#
# Auto generated 01-08-2012 16:27
#
# Manual updates:
# Only the data in the array - everything else is removed by next
# writing. "version" and "dependencies" must not be touched!
########################################################################

$EM_CONF[$_EXTKEY] = array(
	'title' => 'betatext',
	'description' => 'Markierung und Kommentierung von Textstellen',
	'category' => 'plugin',
	'author' => 'Alexander Schulze, Marko Deutscher',
	'author_email' => 'asz@wegewerk.com, mdt@wegewerk.com',
	'shy' => '',
	'dependencies' => '',
	'conflicts' => '',
	'priority' => '',
	'module' => '',
	'state' => 'alpha',
	'internal' => '',
	'uploadfolder' => 0,
	'createDirs' => '',
	'modify_tables' => '',
	'clearCacheOnLoad' => 0,
	'lockType' => '',
	'author_company' => '',
	'version' => '0.0.0',
	'constraints' => array(
		'depends' => array(
		),
		'conflicts' => array(
		),
		'suggests' => array(
		),
	),
	'_md5_values_when_last_written' => 'a:137:{s:9:"ChangeLog";s:4:"cca9";s:10:"README.txt";s:4:"ee2d";s:12:"ext_icon.gif";s:4:"1bdc";s:17:"ext_localconf.php";s:4:"ad4e";s:14:"ext_tables.php";s:4:"6e78";s:14:"ext_tables.sql";s:4:"f13d";s:25:"icon_tx_wwbbt_comment.gif";s:4:"475a";s:22:"icon_tx_wwbbt_text.gif";s:4:"475a";s:24:"icon_tx_wwbbt_voting.gif";s:4:"475a";s:16:"locallang_db.xml";s:4:"c658";s:7:"tca.php";s:4:"7d68";s:19:"doc/wizard_form.dat";s:4:"4a97";s:20:"doc/wizard_form.html";s:4:"93ef";s:13:"lib/debug.log";s:4:"f130";s:13:"lib/debug.php";s:4:"3285";s:12:"lib/rest.php";s:4:"978b";s:16:"lib/Slim/LICENSE";s:4:"a47e";s:24:"lib/Slim/README.markdown";s:4:"5253";s:22:"lib/Slim/composer.json";s:4:"4481";s:18:"lib/Slim/index.php";s:4:"c840";s:29:"lib/Slim/Slim/Environment.php";s:4:"ee80";s:21:"lib/Slim/Slim/Log.php";s:4:"e752";s:27:"lib/Slim/Slim/LogWriter.php";s:4:"47c5";s:28:"lib/Slim/Slim/Middleware.php";s:4:"0627";s:23:"lib/Slim/Slim/Route.php";s:4:"9ce7";s:24:"lib/Slim/Slim/Router.php";s:4:"c7c8";s:22:"lib/Slim/Slim/Slim.php";s:4:"68e3";s:22:"lib/Slim/Slim/View.php";s:4:"cfd0";s:32:"lib/Slim/Slim/Exception/Pass.php";s:4:"4ac1";s:40:"lib/Slim/Slim/Exception/RequestSlash.php";s:4:"8cde";s:32:"lib/Slim/Slim/Exception/Stop.php";s:4:"0ca2";s:30:"lib/Slim/Slim/Http/Headers.php";s:4:"0480";s:30:"lib/Slim/Slim/Http/Request.php";s:4:"f922";s:31:"lib/Slim/Slim/Http/Response.php";s:4:"9d5c";s:27:"lib/Slim/Slim/Http/Util.php";s:4:"efbd";s:41:"lib/Slim/Slim/Middleware/ContentTypes.php";s:4:"c8ec";s:34:"lib/Slim/Slim/Middleware/Flash.php";s:4:"46fa";s:43:"lib/Slim/Slim/Middleware/MethodOverride.php";s:4:"3f01";s:45:"lib/Slim/Slim/Middleware/PrettyExceptions.php";s:4:"553f";s:42:"lib/Slim/Slim/Middleware/SessionCookie.php";s:4:"6a4d";s:35:"lib/Slim/docs/caching-etag.markdown";s:4:"0c74";s:38:"lib/Slim/docs/caching-expires.markdown";s:4:"6fa7";s:44:"lib/Slim/docs/caching-last-modified.markdown";s:4:"135a";s:30:"lib/Slim/docs/caching.markdown";s:4:"8981";s:34:"lib/Slim/docs/environment.markdown";s:4:"1b7c";s:35:"lib/Slim/docs/errors-debug.markdown";s:4:"70c0";s:43:"lib/Slim/docs/errors-error-handler.markdown";s:4:"2777";s:46:"lib/Slim/docs/errors-notfound-handler.markdown";s:4:"1384";s:36:"lib/Slim/docs/errors-output.markdown";s:4:"b00b";s:39:"lib/Slim/docs/errors-reporting.markdown";s:4:"1e42";s:29:"lib/Slim/docs/errors.markdown";s:4:"d978";s:28:"lib/Slim/docs/flash.markdown";s:4:"b70d";s:35:"lib/Slim/docs/hooks-custom.markdown";s:4:"c3c0";s:36:"lib/Slim/docs/hooks-default.markdown";s:4:"f5a9";s:34:"lib/Slim/docs/hooks-usage.markdown";s:4:"d82b";s:28:"lib/Slim/docs/hooks.markdown";s:4:"2e1d";s:23:"lib/Slim/docs/index.txt";s:4:"cb7b";s:36:"lib/Slim/docs/instantiation.markdown";s:4:"3f0f";s:30:"lib/Slim/docs/logging.markdown";s:4:"f561";s:37:"lib/Slim/docs/middleware-add.markdown";s:4:"a907";s:46:"lib/Slim/docs/middleware-architecture.markdown";s:4:"f8e2";s:48:"lib/Slim/docs/middleware-implementation.markdown";s:4:"aa98";s:33:"lib/Slim/docs/middleware.markdown";s:4:"9f96";s:28:"lib/Slim/docs/modes.markdown";s:4:"1c5e";s:39:"lib/Slim/docs/names-and-scopes.markdown";s:4:"afa3";s:38:"lib/Slim/docs/request-cookies.markdown";s:4:"f0b7";s:38:"lib/Slim/docs/request-headers.markdown";s:4:"6ec6";s:38:"lib/Slim/docs/request-helpers.markdown";s:4:"c425";s:37:"lib/Slim/docs/request-method.markdown";s:4:"1fc8";s:41:"lib/Slim/docs/request-parameters.markdown";s:4:"f94c";s:36:"lib/Slim/docs/request-paths.markdown";s:4:"eb3b";s:34:"lib/Slim/docs/request-xhr.markdown";s:4:"2314";s:30:"lib/Slim/docs/request.markdown";s:4:"e553";s:36:"lib/Slim/docs/response-body.markdown";s:4:"ee8f";s:39:"lib/Slim/docs/response-cookies.markdown";s:4:"01fe";s:38:"lib/Slim/docs/response-header.markdown";s:4:"e8a9";s:39:"lib/Slim/docs/response-helpers.markdown";s:4:"7f9f";s:38:"lib/Slim/docs/response-status.markdown";s:4:"090b";s:31:"lib/Slim/docs/response.markdown";s:4:"6342";s:41:"lib/Slim/docs/routing-conditions.markdown";s:4:"b3d8";s:37:"lib/Slim/docs/routing-custom.markdown";s:4:"2d67";s:37:"lib/Slim/docs/routing-delete.markdown";s:4:"2d8c";s:38:"lib/Slim/docs/routing-generic.markdown";s:4:"a001";s:34:"lib/Slim/docs/routing-get.markdown";s:4:"10c4";s:43:"lib/Slim/docs/routing-helpers-halt.markdown";s:4:"fa86";s:43:"lib/Slim/docs/routing-helpers-pass.markdown";s:4:"7594";s:47:"lib/Slim/docs/routing-helpers-redirect.markdown";s:4:"6a1e";s:43:"lib/Slim/docs/routing-helpers-stop.markdown";s:4:"415c";s:45:"lib/Slim/docs/routing-helpers-urlfor.markdown";s:4:"2466";s:38:"lib/Slim/docs/routing-helpers.markdown";s:4:"c269";s:46:"lib/Slim/docs/routing-indepth-slashes.markdown";s:4:"1796";s:51:"lib/Slim/docs/routing-indepth-with-rewrite.markdown";s:4:"5d7d";s:54:"lib/Slim/docs/routing-indepth-without-rewrite.markdown";s:4:"f7d6";s:38:"lib/Slim/docs/routing-indepth.markdown";s:4:"5599";s:41:"lib/Slim/docs/routing-middleware.markdown";s:4:"e7db";s:36:"lib/Slim/docs/routing-names.markdown";s:4:"3540";s:38:"lib/Slim/docs/routing-options.markdown";s:4:"a493";s:41:"lib/Slim/docs/routing-parameters.markdown";s:4:"8c85";s:35:"lib/Slim/docs/routing-post.markdown";s:4:"32c4";s:34:"lib/Slim/docs/routing-put.markdown";s:4:"a6c2";s:30:"lib/Slim/docs/routing.markdown";s:4:"cccb";s:31:"lib/Slim/docs/sessions.markdown";s:4:"b8f5";s:31:"lib/Slim/docs/settings.markdown";s:4:"7615";s:42:"lib/Slim/docs/system-requirements.markdown";s:4:"abe4";s:35:"lib/Slim/docs/views-custom.markdown";s:4:"76e8";s:33:"lib/Slim/docs/views-data.markdown";s:4:"a606";s:38:"lib/Slim/docs/views-rendering.markdown";s:4:"a23a";s:37:"lib/Slim/docs/views-settings.markdown";s:4:"c1e2";s:28:"lib/Slim/docs/views.markdown";s:4:"bf81";s:30:"lib/Slim/docs/welcome.markdown";s:4:"4f06";s:34:"lib/Slim/tests/EnvironmentTest.php";s:4:"fda7";s:22:"lib/Slim/tests/Foo.php";s:4:"2de6";s:26:"lib/Slim/tests/LogTest.php";s:4:"75ab";s:32:"lib/Slim/tests/LogWriterTest.php";s:4:"005b";s:33:"lib/Slim/tests/MiddlewareTest.php";s:4:"0f94";s:21:"lib/Slim/tests/README";s:4:"0214";s:28:"lib/Slim/tests/RouteTest.php";s:4:"e65a";s:29:"lib/Slim/tests/RouterTest.php";s:4:"1514";s:27:"lib/Slim/tests/SlimTest.php";s:4:"410b";s:27:"lib/Slim/tests/ViewTest.php";s:4:"5436";s:35:"lib/Slim/tests/Http/HeadersTest.php";s:4:"9dfa";s:35:"lib/Slim/tests/Http/RequestTest.php";s:4:"891d";s:36:"lib/Slim/tests/Http/ResponseTest.php";s:4:"9cd6";s:32:"lib/Slim/tests/Http/UtilTest.php";s:4:"aaae";s:46:"lib/Slim/tests/Middleware/ContentTypesTest.php";s:4:"d6d8";s:39:"lib/Slim/tests/Middleware/FlashTest.php";s:4:"72ee";s:48:"lib/Slim/tests/Middleware/MethodOverrideTest.php";s:4:"c488";s:50:"lib/Slim/tests/Middleware/PrettyExceptionsTest.php";s:4:"8e31";s:47:"lib/Slim/tests/Middleware/SessionCookieTest.php";s:4:"93f9";s:33:"lib/Slim/tests/templates/test.php";s:4:"125f";s:22:"lib/actions/delete.php";s:4:"062a";s:19:"lib/actions/get.php";s:4:"4c6e";s:20:"lib/actions/post.php";s:4:"334b";s:19:"lib/actions/put.php";s:4:"461c";s:28:"lib/models/wwbbt_comment.php";s:4:"038a";s:28:"lib/models/wwbbt_general.php";s:4:"1c74";s:25:"lib/models/wwbbt_text.php";s:4:"34ab";}',
	'suggests' => array(
	),
);

?>
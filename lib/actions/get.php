<?php


// GET /user
$we_betatext -> get (
	'/user',
	function()
	{
		require BBT_restpath . '/models/webetatext_user.php';

		$object = new webetatext_user();

		$out = $object -> get();

		send_response ( $out );
	}
);


// GET /comments/c123
$we_betatext -> get (
	'/comments/:id',
	function ( $id )
	{
		require BBT_restpath . '/models/webetatext_comment.php';

		$object = new webetatext_comment();

		$out = $object -> commentlist ( $id );

		send_response ( $out );
	}
);
// GET /psteps/text1234
$we_betatext -> get (
	'/psteps/:id',
	function ( $id )
	{
		require BBT_restpath . '/models/webetatext_pstep.php';

		$object = new webetatext_pstep();

		$out = $object -> steplist ( $id );

		send_response ( $out );
	}
);


// GET /text/123
$we_betatext -> get (
	'/:model/:id',
	function ( $model, $id )
	{
		$model = 'webetatext_' . $model;

		require BBT_restpath . '/models/' . $model . '.php';

		$object = new $model;

		$out = $object -> get ( $id );

		send_response ( $out );
	}
);


// GET /delcomment/123/abcd1234
$we_betatext -> get (
	'/delcomment/:id/:authhash',
	function ( $id, $authhash )
	{
		require BBT_restpath . '/models/webetatext_comment.php';

		$object = new webetatext_comment();

		$out = $object -> deleteComment ( $id, $authhash );

		send_response ( $out );
	}
);

?>
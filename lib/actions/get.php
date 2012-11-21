<?php


// GET /user
$ww_bbt -> get (
	'/user',
	function()
	{
		require BBT_restpath . '/models/wwbbt_user.php';

		$object = new wwbbt_user();

		$out = $object -> get();

		send_response ( $out );
	}
);


// GET /comments/c123
$ww_bbt -> get (
	'/comments/:id',
	function ( $id )
	{
		require BBT_restpath . '/models/wwbbt_comment.php';

		$object = new wwbbt_comment();

		$out = $object -> commentlist ( $id );

		send_response ( $out );
	}
);
// GET /psteps/text1234
$ww_bbt -> get (
	'/psteps/:id',
	function ( $id )
	{
		require BBT_restpath . '/models/wwbbt_pstep.php';

		$object = new wwbbt_pstep();

		$out = $object -> steplist ( $id );

		send_response ( $out );
	}
);


// GET /text/123
$ww_bbt -> get (
	'/:model/:id',
	function ( $model, $id )
	{
		$model = 'wwbbt_' . $model;

		require BBT_restpath . '/models/' . $model . '.php';

		$object = new $model;

		$out = $object -> get ( $id );

		send_response ( $out );
	}
);


// GET /delcomment/123/abcd1234
$ww_bbt -> get (
	'/delcomment/:id/:authhash',
	function ( $id, $authhash )
	{
		require BBT_restpath . '/models/wwbbt_comment.php';

		$object = new wwbbt_comment();

		$out = $object -> deleteComment ( $id, $authhash );

		send_response ( $out );
	}
);

?>
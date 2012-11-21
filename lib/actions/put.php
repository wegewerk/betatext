<?php

$ww_bbt -> put (
	'/:model/:id',
	function ( $model, $id )
	{
		$model = 'wwbbt_' . $model;

		require BBT_restpath . '/models/' . $model . '.php';

		$object = new $model;

		$out = $object -> put ( $id );

		send_response ( $out );
	}
);

?>
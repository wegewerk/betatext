<?php

$we_betatext -> put (
	'/:model/:id',
	function ( $model, $id )
	{
		$model = 'webetatext_' . $model;

		require BBT_restpath . '/models/' . $model . '.php';

		$object = new $model;

		$out = $object -> put ( $id );

		send_response ( $out );
	}
);

?>
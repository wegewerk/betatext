<?php

$we_betatext->post(
	'/:model',
	function ($model)
	{
		$model = 'webetatext_' . $model;

		require BBT_restpath . '/models/' . $model . '.php';

		$object = new $model;

		$out = $object -> post();

		send_response ( $out );
	}
);

?>
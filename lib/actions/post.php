<?php

$ww_bbt->post(
	'/:model',
	function ($model)
	{
		$model = 'wwbbt_' . $model;

		require BBT_restpath . '/models/' . $model . '.php';

		$object = new $model;

		$out = $object -> post();

		send_response ( $out );
	}
);

?>
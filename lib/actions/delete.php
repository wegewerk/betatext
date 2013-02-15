<?php
$we_betatext->delete('/:model/:id', function ($model,$id) {
	$filename = "be/data/$model-$id.json";
	if( ! file_exists($filename)) {
		$we_betatext->notFound();
	} else {
		unlink("be/data/$model-$id.json");
		echo "$model $id deleted.";
	}
});
?>
<?php
$ww_bbt->delete('/:model/:id', function ($model,$id) {
	$filename = "be/data/$model-$id.json";
	if( ! file_exists($filename)) {
		$ww_bbt->notFound();
	} else {
		unlink("be/data/$model-$id.json");
		echo "$model $id deleted.";
	}
});
?>
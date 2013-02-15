<?php
if (!defined('TYPO3_MODE')) {
    die ('Access denied.');
}
$TYPO3_CONF_VARS['FE']['eID_include']['bbt'] = 'EXT:we_betatext/lib/rest.php';


if (TYPO3_MODE=='FE'){
    $GLOBALS['TYPO3_CONF_VARS']['EXTCONF']['sr_feuser_register']['extendingTCA'][] = $_EXTKEY;
}
?>
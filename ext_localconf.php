<?php
if (!defined('TYPO3_MODE')) {
    die ('Access denied.');
}

$GLOBALS['TYPO3_CONF_VARS']['FE']['eID_include']['bbt'] = 'EXT:we_betatext/lib/rest.php';


if (TYPO3_MODE=='FE'){
    $GLOBALS['TYPO3_CONF_VARS']['EXTCONF']['sr_feuser_register']['extendingTCA'][] = $_EXTKEY;
}

if (!function_exists('user_betatext_enabled')) {
	function user_betatext_enabled()
	{
		$extSettings = unserialize($GLOBALS['TYPO3_CONF_VARS']['EXT']['extConf']['we_betatext']);
		return $extSettings['dokType'] == $GLOBALS['TSFE']->page['doktype'] && $GLOBALS['TSFE']->page['tx_webetatext_enable'] == 1;
	}
}
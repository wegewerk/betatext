<?php
if (!defined('TYPO3_MODE')) {
	die ('Access denied.');
}

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addStaticFile(
	$_EXTKEY,
    'Configuration/TypoScript/',
    'betatext base configuration'
);

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addStaticFile(
	$_EXTKEY,
    'Configuration/TypoScript/Default/',
    'betatext default css'
);

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::allowTableOnStandardPages("tx_webetatext_process");

if (TYPO3_MODE == 'BE') {
	\TYPO3\CMS\Extbase\Utility\ExtensionUtility::registerModule(
	    'Wegewerk.' . $_EXTKEY,
	    'web',
	    'betatext',
	    '',
	    array(
	        'Backend' => 'index',
	    ),
	    array(
	        'access' => 'user,group',
	        'icon' => 'EXT:' . $_EXTKEY . '/ext_icon.gif',
	        'labels' => 'LLL:EXT:' . $_EXTKEY . '/Resources/Private/Language/locallang_mod.xlf',
	    )
	);
}

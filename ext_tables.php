<?php
if (!defined('TYPO3_MODE')) {
	die ('Access denied.');
}
t3lib_extMgm::addStaticFile($_EXTKEY, 'static/', 'betatext');

$TCA['tx_webetatext_text'] = array (
	'ctrl' => array (
		'title'     => 'LLL:EXT:we_betatext/locallang_db.xml:tx_webetatext_text',
		'label'     => 'TextID',
		'tstamp'    => 'tstamp',
		'crdate'    => 'crdate',
		'cruser_id' => 'cruser_id',
		'fe_cruser_id' => 'fe_cruser_id',
		'default_sortby' => 'ORDER BY crdate',
		'delete' => 'deleted',
		'enablecolumns' => array (
			'disabled' => 'hidden',
		),
		'dynamicConfigFile' => t3lib_extMgm::extPath($_EXTKEY).'tca.php',
		'iconfile'          => t3lib_extMgm::extRelPath($_EXTKEY).'icon_tx_webetatext_text.gif',
	),
);

$TCA['tx_webetatext_comment'] = array (
	'ctrl' => array (
		'title'     => 'LLL:EXT:we_betatext/locallang_db.xml:tx_webetatext_comment',
		'label'     => 'Content',
		'tstamp'    => 'tstamp',
		'crdate'    => 'crdate',
		'cruser_id' => 'cruser_id',
		'fe_cruser_id' => 'fe_cruser_id',
		'default_sortby' => 'ORDER BY crdate',
		'delete' => 'deleted',
		'enablecolumns' => array (
			'disabled' => 'hidden',
		),
		'dynamicConfigFile' => t3lib_extMgm::extPath($_EXTKEY).'tca.php',
		'iconfile'          => t3lib_extMgm::extRelPath($_EXTKEY).'icon_tx_webetatext_comment.gif',
	),
);

$TCA['tx_webetatext_vote'] = array (
	'ctrl' => array (
		'title'     => 'LLL:EXT:we_betatext/locallang_db.xml:tx_webetatext_vote',
		'label'     => 'uid',
		'tstamp'    => 'tstamp',
		'crdate'    => 'crdate',
		'cruser_id' => 'cruser_id',
		'fe_cruser_id' => 'fe_cruser_id',
		'default_sortby' => 'ORDER BY crdate',
		'delete' => 'deleted',
		'enablecolumns' => array (
			'disabled' => 'hidden',
		),
		'dynamicConfigFile' => t3lib_extMgm::extPath($_EXTKEY).'tca.php',
		'iconfile'          => t3lib_extMgm::extRelPath($_EXTKEY).'icon_tx_webetatext_voting.gif',
	),
);
$TCA['tx_webetatext_process'] = array (
	'ctrl' => array (
		'title'     => 'LLL:EXT:we_betatext/locallang_db.xml:tx_webetatext_process',
		'label'     => 'StepIndex',
		'tstamp'    => 'tstamp',
		'crdate'    => 'crdate',
		'cruser_id' => 'cruser_id',
		'default_sortby' => 'ORDER BY sort',
		'sortby' => 'sort',
		'delete' => 'deleted',
		'enablecolumns' => array (
			'disabled' => 'hidden',
		),
		'dynamicConfigFile' => t3lib_extMgm::extPath($_EXTKEY).'tca.php',
		'iconfile'          => t3lib_extMgm::extRelPath($_EXTKEY).'icon_tx_webetatext_process.gif',
	),
);

t3lib_extMgm::allowTableOnStandardPages("tx_webetatext_process");



$addColumns = array (
	'tx_webetatext_logo' => Array (
		'exclude' => 1,
		'label' => 'LLL:EXT:we_betatext/locallang_db.xml:fe_users.tx_webetatext_logo',
		'config' => Array (
			'type' => 'group',
			'internal_type' => 'file',
			'allowed' => $GLOBALS['TYPO3_CONF_VARS']['GFX']['imagefile_ext'],
			'max_size' => 1000,
			'uploadfolder' => 'uploads/tx_webetatext',
			'show_thumbs' => 1,
			'size' => 1,
			'minitems' => 0,
			'maxitems' => 1,
		)
	),
    'tx_webetatext_verified' => Array (
        'exclude' => 1,
        'label' => 'LLL:EXT:we_betatext/locallang_db.xml:fe_users.tx_webetatext_verified',
		'config'    => array(
			'type'    => 'check',
			'default' => '1'
		)
    ),
	'tx_webetatext_verification_requested' => Array (
		'exclude' => 1,
		'label' => 'LLL:EXT:we_betatext/locallang_db.xml:fe_users.tx_webetatext_verification_requested',
		'config'    => array(
			'type'    => 'check',
			'default' => '0'
		)
	),		
);

t3lib_extMgm::addTCAcolumns('fe_users',$addColumns,true);
t3lib_extMgm::addToAllTCATypes('fe_users','--div--;betatext,tx_webetatext_logo,tx_webetatext_verification_requested,tx_webetatext_verified;;;;1-1-1');

/* Seiteneinstellungen */
$TCA['pages']['columns']['doktype']['config']['items'][] = array ( 'betatext: kommentierbare Seite', 124, 'EXT:we_betatext/icons/bbt-page.gif');
t3lib_SpriteManager::addTcaTypeIcon('pages', '124', '../typo3conf/ext/we_betatext/icons/bbt-page.png');


$addColumns = array (
	'tx_webetatext_enable' => array (
		'exclude' => 1,
		'label'   => 'LLL:EXT:we_betatext/locallang_db.xml:pages.tx_webetatext_enable',
		'config'  => array (
			'type'    => 'check',
			'default' => '0'
		)
	),
	'tx_webetatext_infomail_to' => array (
		'exclude' => 1,
		'label'   => 'LLL:EXT:we_betatext/locallang_db.xml:pages.tx_webetatext_infomail_to',
		'config'  => array (
			'type' => 'input',
			'size' => '20',
			'max' => '50',
			'eval' => 'trim',
			'default' => ''
		)
	),
	'tx_webetatext_pstep_title' => array (
		'exclude' => 1,
		'label'   => 'LLL:EXT:we_betatext/locallang_db.xml:pages.tx_webetatext_pstep_title',
		'config'  => array (
			'type' => 'input',
			'size' => '20',
			'max' => '50',
			'eval' => 'trim',
			'default' => ''
		)
	),
);

t3lib_extMgm::addTCAcolumns('pages',$addColumns,true);
t3lib_extMgm::addToAllTCAtypes('pages',
								'--div--;betatext,tx_webetatext_enable,tx_webetatext_infomail_to,tx_webetatext_pstep_title;;;;1-1-1');
?>
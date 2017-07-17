<?php
defined('TYPO3_MODE') or die();

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

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTCAcolumns('fe_users',$addColumns,true);
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addToAllTCATypes('fe_users','--div--;betatext,tx_webetatext_logo,tx_webetatext_verification_requested,tx_webetatext_verified;;;;1-1-1');

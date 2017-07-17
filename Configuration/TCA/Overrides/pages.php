<?php
defined('TYPO3_MODE') or die();

$GLOBALS['TCA']['pages']['columns']['doktype']['config']['items'][] = array ( 'betatext: kommentierbare Seite', 124, 'EXT:we_betatext/Resources/Public/Icons/bbt-page.gif');
\TYPO3\CMS\Backend\Sprite\SpriteManager::addTcaTypeIcon('pages', '124', '../typo3conf/ext/we_betatext/Resources/Public/Icons/bbt-page.png');


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

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTCAcolumns('pages',$addColumns,true);
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addToAllTCAtypes('pages',
    '--div--;betatext,tx_webetatext_enable,tx_webetatext_infomail_to,tx_webetatext_pstep_title;;;;1-1-1');


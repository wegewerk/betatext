<?php
defined('TYPO3_MODE') or die();

return array (
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
        'iconfile'          => \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::extRelPath('we_betatext').'icon_tx_webetatext_text.gif',
    ),
    'interface' => array (
        'showRecordFieldList' => 'hidden,TextID,Version,Content,ContentRaw'
    ),
    'feInterface' => $TCA['tx_webetatext_text']['feInterface'],
    'columns' => array (
        'hidden' => array (
            'exclude' => 1,
            'label'   => 'LLL:EXT:lang/locallang_general.xml:LGL.hidden',
            'config'  => array (
                'type'    => 'check',
                'default' => '0'
            )
        ),
        'TextID' => array (
            'exclude' => 0,
            'label' => 'LLL:EXT:we_betatext/locallang_db.xml:tx_webetatext_text.id_text',
            'config' => array (
                'type' => 'input',
                'size' => '30',
            )
        ),
        'Version' => array (
            'exclude' => 0,
            'label' => 'LLL:EXT:we_betatext/locallang_db.xml:tx_webetatext_text.version',
            'config' => array (
                'type'     => 'input',
                'size'     => '6',
                'max'      => '9',
                'eval'     => 'int',
                'checkbox' => '0',
                'range'    => array (
                    'upper' => '999999999',
                    'lower' => '1'
                ),
                'default' => 1
            )
        ),
        'Content' => array (
            'exclude' => 0,
            'label' => 'LLL:EXT:we_betatext/locallang_db.xml:tx_webetatext_text.content',
            'config' => array (
                'type' => 'text',
                'cols' => '30',
                'rows' => '15',
            )
        ),
        'ContentRaw' => array (
            'exclude' => 0,
            'label' => 'LLL:EXT:we_betatext/locallang_db.xml:tx_webetatext_text.content_raw',
            'config' => array (
                'type' => 'text',
                'cols' => '30',
                'rows' => '15',
            )
        ),
    ),
    'types' => array (
        '0' => array('showitem' => 'hidden;;1;;1-1-1, TextID, Version, Content, ContentRaw')
    ),
    'palettes' => array (
        '1' => array('showitem' => '')
    )
);

<?php
defined('TYPO3_MODE') or die();

return array (
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
        'iconfile'          => \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::extRelPath('we_betatext').'icon_tx_webetatext_comment.gif',
    ),
    'interface' => array (
        'showRecordFieldList' => 'hidden,CommentedText,Content,TextID,TextVersion,StartIndex,EndIndex'
    ),
    'feInterface' => $TCA['tx_webetatext_comment']['feInterface'],
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
        'TextVersion' => array (
            'exclude' => 0,
            'label' => 'LLL:EXT:we_betatext/locallang_db.xml:tx_webetatext_comment.text_version',
            'config' => array (
                'type'     => 'input',
                'size'     => '6',
                'max'      => '9',
                'eval'     => 'int',
                'checkbox' => '0',
                'range'    => array (
                    'upper' => '999999999',
                    'lower' => '0'
                ),
                'default' => 0
            )
        ),
        'CommentedText' => array (
            'exclude' => 0,
            'label' => 'LLL:EXT:we_betatext/locallang_db.xml:tx_webetatext_comment.commented_text',
            'config' => array (
                'type' => 'text',
                'cols' => '30',
                'rows' => '10',
            )
        ),
        'Content' => array (
            'exclude' => 0,
            'label' => 'LLL:EXT:we_betatext/locallang_db.xml:tx_webetatext_comment.content',
            'config' => array (
                'type' => 'text',
                'cols' => '30',
                'rows' => '10',
            )
        ),
        'StartIndex' => array (
            'exclude' => 0,
            'label' => 'LLL:EXT:we_betatext/locallang_db.xml:tx_webetatext_comment.index_start',
            'config' => array (
                'type'     => 'input',
                'size'     => '6',
                'max'      => '9',
                'eval'     => 'int',
                'checkbox' => '0',
                'range'    => array (
                    'upper' => '999999999',
                    'lower' => '0'
                ),
                'default' => 0
            )
        ),
        'EndIndex' => array (
            'exclude' => 0,
            'label' => 'LLL:EXT:we_betatext/locallang_db.xml:tx_webetatext_comment.index_end',
            'config' => array (
                'type'     => 'input',
                'size'     => '6',
                'max'      => '9',
                'eval'     => 'int',
                'checkbox' => '0',
                'range'    => array (
                    'upper' => '999999999',
                    'lower' => '0'
                ),
                'default' => 0
            )
        ),
    ),
    'types' => array (
        '0' => array('showitem' => 'hidden;;1;;1-1-1, CommentedText, Content')
    ),
    'palettes' => array (
        '1' => array('showitem' => '')
    )
);

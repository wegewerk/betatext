<?php
defined('TYPO3_MODE') or die();

return array (
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
        'iconfile'          => \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::extRelPath('we_betatext').'icon_tx_webetatext_voting.gif',
    ),
    'interface' => array (
        'showRecordFieldList' => 'hidden,CommentID,Value'
    ),
    'feInterface' => $TCA['tx_webetatext_vote']['feInterface'],
    'columns' => array (
        'hidden' => array (
            'exclude' => 1,
            'label'   => 'LLL:EXT:lang/locallang_general.xml:LGL.hidden',
            'config'  => array (
                'type'    => 'check',
                'default' => '0'
            )
        ),
        'CommentID' => array (
            'exclude' => 0,
            'label' => 'LLL:EXT:we_betatext/locallang_db.xml:tx_webetatext_vote.uid_comment',
            'config' => array (
                'type' => 'select',
                'foreign_table' => 'tx_webetatext_comment',
                'size' => 1,
                'minitems' => 1,
                'maxitems' => 1,
            )
        ),
        'Value' => array (
            'exclude' => 0,
            'label' => 'LLL:EXT:we_betatext/locallang_db.xml:tx_webetatext_vote.value',
            'config' => array (
                'type' => 'radio',
                'items' => array (
                    array('LLL:EXT:we_betatext/locallang_db.xml:tx_webetatext_vote.value.I.0', '-1'),
                    array('LLL:EXT:we_betatext/locallang_db.xml:tx_webetatext_vote.value.I.1', '0'),
                    array('LLL:EXT:we_betatext/locallang_db.xml:tx_webetatext_vote.value.I.2', '1'),
                ),
            )
        ),
    ),
    'types' => array (
        '0' => array('showitem' => 'hidden;;1;;1-1-1, CommentID, Value')
    ),
    'palettes' => array (
        '1' => array('showitem' => '')
    )
);

<?php
defined('TYPO3_MODE') or die();

return array (
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
        'iconfile'          => \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::extRelPath('we_betatext').'icon_tx_webetatext_process.gif',
    ),
    'interface' => array (
        'showRecordFieldList' => 'hidden,CommentID,Value'
    ),
    'feInterface' => $TCA['tx_webetatext_process']['feInterface'],
    'columns' => array (
        'hidden' => array (
            'exclude' => 1,
            'label'   => 'LLL:EXT:lang/locallang_general.xml:LGL.hidden',
            'config'  => array (
                'type'    => 'check',
                'default' => '0'
            )
        ),
        'StepIndex' => array (
            'exclude' => 0,
            'label' => 'Schritt',
            'config' => array (
                'type' => 'input',
                'size' => '3',
            )
        ),
        'IsCurrent' => array (
            'exclude' => 0,
            'label' => 'ist aktueller Schritt',
            'config' => array (
                'type'    => 'check',
                'default' => '0'
            )
        ),
        'Link' => array (
            'exclude' => 0,
            'label' => 'Verweisziel',
            'config' => array (
                'type' => 'group',
                'internal_type' => 'db',
                'allowed' => 'pages',
                'size' => '1',
                'maxitems' => '1',
                'minitems' => '0',
                'show_thumbs' => '1',
                'wizards' => array(
                    'suggest' => array(
                        'type' => 'suggest',
                    ),
                ),
            ),
        ),
        'Content' => array (
            'exclude' => 0,
            'label' => 'Text',
            'config' => array (
                'type' => 'text',
                'cols' => '30',
                'rows' => '10',
            )
        ),
    ),
    'types' => array (
        '0' => array('showitem' => 'hidden;;1;;1-1-1, StepIndex, IsCurrent, Content;;;richtext[]:rte_transform[mode=ts_css],Link ')
    ),
    'palettes' => array (
        '1' => array('showitem' => '')
    )
);

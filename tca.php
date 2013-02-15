<?php
if (!defined('TYPO3_MODE')) {
	die ('Access denied.');
}

$TCA['tx_webetatext_text'] = array (
	'ctrl' => $TCA['tx_webetatext_text']['ctrl'],
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



$TCA['tx_webetatext_comment'] = array (
	'ctrl' => $TCA['tx_webetatext_comment']['ctrl'],
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



$TCA['tx_webetatext_vote'] = array (
	'ctrl' => $TCA['tx_webetatext_vote']['ctrl'],
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

$TCA['tx_webetatext_process'] = array (
	'ctrl' => $TCA['tx_webetatext_process']['ctrl'],
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

?>
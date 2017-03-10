<?php

/***************************************************************
 * Extension Manager/Repository config file for ext "we_betatext".
 *
 * Auto generated 23-09-2014 09:33
 *
 * Manual updates:
 * Only the data in the array - everything else is removed by next
 * writing. "version" and "dependencies" must not be touched!
 ***************************************************************/

$EM_CONF[$_EXTKEY] = array(
	'title' => 'betatext',
	'description' => 'Betatext does allow users to comment any part of a text. The comments can be rated up and down. Users may request to be marked as “verified” to show that they represent officially an institution, use their real name or are especially trusted. Betatext is used for collaborating work; One can leave constructive criticism towards specific words and phrases in a text and what may be added or changed before the final version of the document is printed. This extension is available on github: https://github.com/wegewerk/betatext.git',
	'category' => 'plugin',
	'author' => 'wegewerk',
	'author_email' => 'betatext@wegewerk.com',
	'shy' => '',
	'dependencies' => 'phpexcel_service,realurl',
	'conflicts' => '',
	'priority' => '',
	'module' => 'mod1',
	'state' => 'beta',
	'internal' => '',
	'uploadfolder' => 0,
	'createDirs' => '',
	'modify_tables' => '',
	'clearCacheOnLoad' => 0,
	'lockType' => '',
	'author_company' => 'wegewerk',
	'version' => '2.2.3',
	'constraints' => array(
		'depends' => array(
			'typo3' => '6.2.0-6.2.999',
			'realurl' => '',
			'phpexcel_service' => '1.8.1-1.8.999',
		),
		'conflicts' => array(
		),
		'suggests' => array(
		),
	),
	'suggests' => array(
	),
);

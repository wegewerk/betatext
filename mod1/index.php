<?php
/***************************************************************
*  Copyright notice
*
*  (c) 2012 Alexander Schulze <asz@wegewerk.com>
*  All rights reserved
*
*  This script is part of the TYPO3 project. The TYPO3 project is
*  free software; you can redistribute it and/or modify
*  it under the terms of the GNU General Public License as published by
*  the Free Software Foundation; either version 2 of the License, or
*  (at your option) any later version.
*
*  The GNU General Public License can be found at
*  http://www.gnu.org/copyleft/gpl.html.
*
*  This script is distributed in the hope that it will be useful,
*  but WITHOUT ANY WARRANTY; without even the implied warranty of
*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*  GNU General Public License for more details.
*
*  This copyright notice MUST APPEAR in all copies of the script!
***************************************************************/
/**
 * [CLASS/FUNCTION INDEX of SCRIPT]
 *
 * Hint: use extdeveval to insert/update function index above.
 */


$LANG->includeLLFile('EXT:we_betatext/mod1/locallang.xml');
require_once PATH_t3lib . 'class.t3lib_scbase.php';
require_once t3lib_extMgm::extPath('we_betatext') . 'lib/phpQuery/phpQuery.php';

$BE_USER->modAccess($MCONF,1);	// This checks permissions and exits if the users has no permission for entry.
	// DEFAULT initialization of a module [END]

$phpExcelService = t3lib_div::makeInstanceService('phpexcel');

/**
 * Module 'betaTEXT' for the 'we_betatext' extension.
 *
 * @author	Alexander Schulze <asz@wegewerk.com>
 * @package	TYPO3
 * @subpackage	tx_wwbbt
 */
class tx_wwbbt_xlsexport extends t3lib_SCbase {
		var $pageinfo;



		// Format der Spaltenköpfe
		var $format_head = array(
            'font' => array(
                'bold' => true
            ),
            'alignment' => array(
                'horizontal' => PHPExcel_Style_Alignment::HORIZONTAL_CENTER,
                'vertical' => PHPExcel_Style_Alignment::VERTICAL_CENTER,
            ),
            'borders' => array(
                'outline' => array(
                    'style' => PHPExcel_Style_Border::BORDER_THIN,
                    'color' => array ( 'rgb' => '000000' )
                )
            ),
            'fill' => array(
                'type' => PHPExcel_Style_Fill::FILL_SOLID,
                'color' => array ( 'rgb' => '999999' )
            )
        );

        var $format_body = array(
            'alignment' => array(
                'horizontal' => PHPExcel_Style_Alignment::HORIZONTAL_LEFT,
                'vertical' => PHPExcel_Style_Alignment::VERTICAL_TOP,
            ),
            'borders' => array(
                'outline' => array(
                    'style' => PHPExcel_Style_Border::BORDER_THIN,
                    'color' => array ( 'rgb' => '000000' )
                )
            )
        );

        // Spalten im Export => Breite (oder "auto")
        var $export_cols = array (
        	'timestamp' => 17,
        	'username'  => 'auto',
        	'email'     => 'auto',
        	'excerpt'   => 40,
        	'comment'   => 40,
        	'likes'     => 15,
        	'dislikes'  => 15,
        	'avg'       => 15
        );

		/**
		 * Initializes the Module
		 * @return	void
		 */
		function init()	{
			global $BE_USER,$LANG,$BACK_PATH,$TCA_DESCR,$TCA,$CLIENT,$TYPO3_CONF_VARS;

			parent::init();
		}

		/**
		 * Adds items to the ->MOD_MENU array. Used for the function menu selector.
		 *
		 * @return	void
		 */
		function menuConfig()	{
			global $LANG;
			$this->MOD_MENU = Array (
				'function' => Array (
					'1' => $LANG->getLL('info'),
				)
			);
			parent::menuConfig();
		}

		/**
		 * Main function of the module. Write the content to $this->content
		 * If you chose "web" as main module, you will need to consider the $this->id parameter which will contain the uid-number of the page clicked in the page tree
		 *
		 * @return	[type]		...
		 */
		function main()	{
			global $BE_USER,$LANG,$BACK_PATH,$TCA_DESCR,$TCA,$CLIENT,$TYPO3_CONF_VARS;

			// Access check!
			// The page will show only if there is a valid page and if this page may be viewed by the user
			$this->pageinfo = t3lib_BEfunc::readPageAccess($this->id,$this->perms_clause);
			$access = is_array($this->pageinfo) ? 1 : 0;

			if (($this->id && $access) || ($BE_USER->user['admin'] && !$this->id))	{

					// Draw the header.
				$this->doc = t3lib_div::makeInstance('mediumDoc');
				$this->doc->backPath = $BACK_PATH;
				$this->doc->form='<form action="" method="post" enctype="multipart/form-data">';

					// JavaScript
				$this->doc->JScode = '
					<script language="javascript" type="text/javascript">
						script_ended = 0;
						function jumpToUrl(URL)	{
							document.location = URL;
						}
					</script>
				';
				$this->doc->postCode='
					<script language="javascript" type="text/javascript">
						script_ended = 1;
						if (top.fsMod) top.fsMod.recentIds["web"] = 0;
					</script>
				';

				$headerSection = $this->doc->getHeader('pages', $this->pageinfo, $this->pageinfo['_thePath']) . '<br />'
					. $LANG->sL('LLL:EXT:lang/locallang_core.xml:labels.path') . ': ' . t3lib_div::fixed_lgd_cs($this->pageinfo['_thePath'], -50);

				$this->content.=$this->doc->startPage($LANG->getLL('title'));
				$this->content.=$this->doc->header($LANG->getLL('title'));
				$this->content.=$this->doc->spacer(5);
				$this->content.=$this->doc->section('',$this->doc->funcMenu($headerSection,t3lib_BEfunc::getFuncMenu($this->id,'SET[function]',$this->MOD_SETTINGS['function'],$this->MOD_MENU['function'])));
				$this->content.=$this->doc->divider(5);


				// Render content:
				$this->moduleContent();


				// ShortCut
				if ($BE_USER->mayMakeShortcut())	{
					$this->content.=$this->doc->spacer(20).$this->doc->section('',$this->doc->makeShortcutIcon('id',implode(',',array_keys($this->MOD_MENU)),$this->MCONF['name']));
				}

				$this->content.=$this->doc->spacer(10);
			} else {
					// If no access or if ID == zero

				$this->doc = t3lib_div::makeInstance('mediumDoc');
				$this->doc->backPath = $BACK_PATH;

				$this->content.=$this->doc->startPage($LANG->getLL('title'));
				$this->content.=$this->doc->header($LANG->getLL('title'));
				$this->content.=$this->doc->spacer(5);
				$this->content.=$this->doc->spacer(10);
			}

		}

		/**
		 * Prints out the module HTML
		 */
		function printContent()	{

			$this->content.=$this->doc->endPage();
			echo $this->content;
		}

		/**
		 * Generates the module content
		 */
		function moduleContent()	{
			switch((string)$this->MOD_SETTINGS['function'])	{
				case 1:
					/*
						'GET:'.t3lib_div::view_array($_GET).'<br />'.
						'POST:'.t3lib_div::view_array($_POST).'<br />'.
					*/
					if (t3lib_div::_GET('export') == 1)
						$this -> xlsCreate();
					else
						$this->content.=$this->doc->section('betaTEXT:',$this -> getOverview(),0,1);
				break;
			}
		}

		/**
		 * Übersicht mit Textauszug und Anzahl der Kommentare/Kommentatoren ausgeben
		 * darunter erscheint ein Link zum Anstoßen des Exports
		 *
		 * @return String HTML
		 */
		function getOverview()
		{
			global $LANG;

			// Textinfo zur Seiten-ID bestimmen
			$select = 'p.title, t.Content,
			           (SELECT COUNT(uid) FROM tx_webetatext_comment WHERE TextID=t.TextID AND hidden=0 AND deleted=0 AND TextVersion<>0) AS comments,
			           (SELECT COUNT(DISTINCT fe_cruser_id) FROM tx_webetatext_comment WHERE TextID=t.TextID AND hidden=0 AND deleted=0 AND TextVersion<>0) AS users';
			$from   = 'pages p LEFT JOIN tx_webetatext_text t ON p.uid=t.pid';
			$where  = 'p.uid=' . intval ( $this -> id );

			$res = $GLOBALS [ 'TYPO3_DB' ] -> exec_SELECTgetSingleRow ( $select, $from, $where );

			// Ergebnis aufbereiten
			$content = trim ( strip_tags ( $res [ 'Content' ] ) );
			$content = preg_replace ( '~\s+~', ' ', $content );
			$content = substr ( $content, 0, 300 ) . '&hellip;';

			$mainParams = '&id='.$this->id . (t3lib_div::_GET('M') ? '&M=' . rawurlencode(t3lib_div::_GET('M')) : '');

			$link = basename(PATH_thisScript) . '?' . $mainParams . '&SET[function]=1&export=1';

			$content = <<<OUT
<h2>$res[title]</h2>
<p>$content</p>
<hr/>
<table>
	<tr>
		<th>{$LANG->getLL('comments')}:</th>
		<td>$res[comments]</td>
	</tr>
	<tr>
		<th>{$LANG->getLL('distinct_users')}:</th>
		<td>$res[users]</td>
	</tr>
</table>
<hr>
<a href="$link">{$LANG->getLL('start_export')}</a>
OUT;
			return $content;
		}

		/**
		 * Excel-Spreadsheet erzeugen und mittels weiterer Funktionen mit Daten befüllen
		 */
		private function xlsCreate()
		{
			global $phpExcelService;

			$phpExcel = $phpExcelService->getPHPExcel();

			$this -> xlsMeta ( $phpExcel );
			$this -> xlsData ( $phpExcel );

			$filename = 'export.xlsx';

			header ( 'Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' );
			header ( 'Content-Disposition: attachment;filename="' . $filename . '"' );
			header ( 'Cache-Control: max-age=0' );

			$excelWriter = $phpExcelService->getInstanceOf('PHPExcel_Writer_Excel2007', $phpExcel);
			$excelWriter -> save ( 'php://output' );

			exit;
		}

		/**
		 * Meta-Angaben in Spreadsheet schreiben (Titel, Datum etc.)
		 *
		 * @param $phpExcel PHPExcel-Objekt
		 */
		private function xlsMeta ( &$phpExcel )
		{
			global $LANG;

			$phpExcel -> getProperties()
	        	-> setCreator ( "TYPO3 CMS" )
				-> setTitle ( $LANG->getLL('workbook_title') )
				-> setSubject ( $LANG->getLL('workbook_title') )
				-> setDescription ( $LANG->getLL('workbook_description') . date('d. m. Y') );

			$phpExcel -> setActiveSheetIndex(0);
		}

		/**
		 * Spreadsheet mit Daten befüllen
		 *
		 * @param $phpExcel PHPExcel-Objekt
		 */
		private function xlsData ( &$phpExcel )
		{
			global $LANG;

			$sheet = $phpExcel -> getActiveSheet();

			$sheet -> setTitle ( $LANG->getLL('workbook_title') );

			$data = $this -> getDbData();

			$col = 0;
			$row = 0;

			// Kopf
			foreach ( $this -> export_cols as $spalte => $breite )
			{
				$sheet -> getCellByColumnAndRow ( $col, 1 )
				       -> setValueExplicit ( $LANG->getLL('col_'.$spalte), PHPExcel_Cell_DataType::TYPE_STRING );

				$col++;
			}

			$sheet -> getStyle ('A1:' . PHPExcel_Cell::stringFromColumnIndex ( count($this -> export_cols)-1 ) . '1')
			       -> applyFromArray ( $this -> format_head );

			// Daten
			foreach ( $data as $row => $dataRow )
			{
				$col = 0;

				foreach ( $this -> export_cols as $dbName => $breite )
				{
					// je nach Typ als String, Integer oder Formel
					// wenn der Wert leer ist, dann natürlich gar nix
					if ( isset ( $dataRow [ $dbName ] ) )
					{
						// Textauszug hat Sonderbehandlung
						if ( $dbName == 'excerpt')
						{
							$arr = $this -> getTextExcerpt ( $dataRow [ 'id' ] );

							if ( is_array ( $arr ) && count ( $arr ) )
							{
								$content = new PHPExcel_RichText();

								$content -> createText ( '...' . $arr [ 'before' ] . ' ' );

								if ( !empty ( $arr [ 'comment' ] ) )
								{
									$selection = $content -> createTextRun ( $arr [ 'comment' ] );

									$selection -> getFont() -> setBold ( true );
									$selection -> getFont() -> setItalic ( true );
									$selection -> getFont() -> setColor ( new PHPExcel_Style_Color ( PHPExcel_Style_Color::COLOR_RED ) );
								}

								$content -> createText ( ' ' . $arr [ 'after' ] . '...' );

								$sheet -> getCellByColumnAndRow ( $col, $row + 2 )
								       -> setValue ( $content );
							}

							$col++;
							continue;

						}
						elseif ( $dbName == 'timestamp' )
							$content = date ( 'd.m.Y H:i', $dataRow [ $dbName ] );
						else
							$content = $dataRow [ $dbName ];

						$dataType = is_numeric ( $content )
							? PHPExcel_Cell_DataType::TYPE_NUMERIC
							: PHPExcel_Cell_DataType::TYPE_STRING;
					}
					elseif ( $dbName == 'avg' )
					{
						$content = '=$F'.($row+2).'-$G'.($row+2);

						$dataType = PHPExcel_Cell_DataType::TYPE_FORMULA;
					}
					else
					{
						$col++;
						continue;
					}

					$sheet -> getCellByColumnAndRow ( $col, $row + 2 )
					       -> setValueExplicit ( $content, $dataType );

					$col++;
				}
			}

			// Spaltenbreiten
			$col = 0;

			foreach ( $this -> export_cols as $spalte => $breite )
			{
				if ( $breite == 'auto' )
					$sheet -> getColumnDimensionByColumn ( $col ) -> setAutoSize(true);
				else
					$sheet -> getColumnDimensionByColumn ( $col ) -> setWidth($breite);

				$col++;
			}

			// Formatierung Datenpart
			$sheet -> getStyle ('A2:' . PHPExcel_Cell::stringFromColumnIndex ( count($this -> export_cols)-1 ) . (count($data)+1))
			       -> applyFromArray ( $this -> format_body );

			$sheet -> getStyle ('A1:' . PHPExcel_Cell::stringFromColumnIndex ( count($this -> export_cols)-1 ) . (count($data)+1))
			       -> getAlignment() -> setWrapText(true);

		}

		/**
		 * Kommentare und ihre Nutzer und Likes laden
		 *
		 * @return Array
		 */
		private function getDbData()
		{
			$select = 'c.uid AS id, c.Content AS comment, c.CommentedText AS excerpt, c.crdate AS timestamp,
					(SELECT COUNT(v1.uid) FROM tx_webetatext_vote v1 WHERE v1.CommentID=c.uid AND v1.Value= 1) AS likes,
					(SELECT COUNT(v2.uid) FROM tx_webetatext_vote v2 WHERE v2.CommentID=c.uid AND v2.Value=-1) AS dislikes,
					u.name AS username,
					u.email,
					u.tx_webetatext_verified AS userverified';

			$table  = 'tx_webetatext_comment c LEFT JOIN fe_users u ON u.uid=c.fe_cruser_id';

			$where = 'c.pid="' . $this -> id . '" AND c.hidden=0 AND c.deleted=0 AND c.TextVersion<>0';

			return $GLOBALS [ 'TYPO3_DB' ] -> exec_SELECTgetRows ( $select, $table, $where, '', 'EndIndex, StartIndex'/*, '48,1'*/ );
		}

		private function getTextExcerpt ( $commentid )
		{
			static $Text = null;

			if ( $Text === null )
			{
				$res = $GLOBALS [ 'TYPO3_DB' ] -> exec_SELECTgetSingleRow ( 'Content', 'tx_webetatext_text', 'pid=' . intval($this->id) );

				$Text = trim ( preg_replace ( '~\s+~', ' ', $res [ 'Content' ] ) );
				$Text = preg_replace ( '~<!--.*-->~U', '', $Text );
			}

			phpQuery::newDocument ( $Text, 'text/html' );

			foreach ( pq('span.savedComment') as $comment )
			{
				if ( !pq ( $comment ) -> hasClass ( 'comment-' . $commentid ) )
					pq ( $comment ) -> replaceWith ( pq ( $comment ) -> contents() );
			}

			$rawResult = phpQuery::getDocument();

			// jetzt noch Text in den Abschnitt vor und nach der Markierung splitten
			if ( preg_match ( '~(.*)<span[^>]*class="savedComment [^>]+>(.*)</span>(.*)~sm', $rawResult, $matches ) )
			{
				$matches = array_map ( 'strip_tags', $matches );

				$strip_length = max ( 50, ( 300 - mb_strlen ( $matches [ 2 ] ) ) / 2 );

				$ret = array (
					'before'  => $this -> truncate ( $matches [ 1 ], $strip_length, 'end' ),
					'comment' => $matches [ 2 ],
					'after'   => $this -> truncate ( $matches [ 3 ], $strip_length, 'beginning' )
				);

				return $ret;
			}
			else
				return false;
		}


		private function truncate ( $text, $length, $keep = 'beginning' )
		{
			$temp = preg_split ( '~\s+~', $text );

			$string = '';

			while ( mb_strlen ( $string ) < $length )
				if ( $keep == 'beginning' )
					$string .= ' ' . array_shift ( $temp );
				else
					$string = array_pop ( $temp ) . ' ' . $string;

			return trim ( $string );
		}

}



if (defined('TYPO3_MODE') && $TYPO3_CONF_VARS[TYPO3_MODE]['XCLASS']['ext/we_betatext/mod1/index.php'])	{
	include_once($TYPO3_CONF_VARS[TYPO3_MODE]['XCLASS']['ext/we_betatext/mod1/index.php']);
}




// Make instance:
$SOBE = t3lib_div::makeInstance('tx_wwbbt_xlsexport');
$SOBE->init();

// Include files?
foreach($SOBE->include_once as $INC_FILE)	include_once($INC_FILE);

$SOBE->main();
$SOBE->printContent();

?>
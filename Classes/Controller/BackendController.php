<?php
/***************************************************************
 *  Copyright notice
 *
 *  (c) 2017 wegewerk. GmbH (info@wegewerk.com)
 *  All rights reserved
 *
 *  This copyright notice MUST APPEAR in all copies of the script!
 ***************************************************************/

namespace Wegewerk\WeBetatext\Controller;

use TYPO3\CMS\Extbase\Mvc\Controller\ActionController;

require_once \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::extPath('we_betatext') . 'lib/phpQuery/phpQuery.php';

/**
 * @package
 */
class BackendController extends ActionController
{

    /**
     * @var TYPO3\CMS\Extbase\Utility\LocalizationUtility
     */
    protected $localization = null;

    public function indexAction()
    {
        $pageID = (int) \TYPO3\CMS\Core\Utility\GeneralUtility::_GP('id') ?: 0;
        if ($this->request->hasArgument('export')) {
            $this->xlsCreate($pageID);
        } else {
            $this->view->assign('overview', $this->getOverview($pageID));
        }
    }

    protected function getOverview($pageID)
    {
        $select = 'p.title, t.Content,
		           (SELECT COUNT(uid) FROM tx_webetatext_comment WHERE TextID=t.TextID AND hidden=0 AND deleted=0 AND TextVersion<>0) AS comments,
		           (SELECT COUNT(DISTINCT fe_cruser_id) FROM tx_webetatext_comment WHERE TextID=t.TextID AND hidden=0 AND deleted=0 AND TextVersion<>0) AS users';
        $from = 'pages p LEFT JOIN tx_webetatext_text t ON p.uid=t.pid';
        $where = 'p.uid=' . intval($pageID);

        $res = $GLOBALS['TYPO3_DB']->exec_SELECTgetSingleRow($select, $from, $where);

        // Ergebnis aufbereiten
        $content = trim(strip_tags($res['Content']));
        $content = preg_replace('~\s+~', ' ', $content);
        $content = substr($content, 0, 300) . '&hellip;';

        return array(
            'title' => $res['title'],
            'text' => $content,
            'comments' => $res['comments'],
            'users' => $res['users'],
        );
    }

    protected function xlsCreate($pageID)
    {
        $phpExcelService = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstanceService('phpexcel');
        $phpExcel = $phpExcelService->getPHPExcel();

        $this->xlsMeta($phpExcel);
        $this->xlsData($phpExcel, $pageID);

        $filename = 'export.xlsx';

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="' . $filename . '"');
        header('Cache-Control: max-age=0');

        $excelWriter = $phpExcelService->getInstanceOf('PHPExcel_Writer_Excel2007', $phpExcel);
        $excelWriter->save('php://output');

        exit;
    }

    protected function xlsMeta($phpExcel)
    {
        $phpExcel->getProperties()
            ->setCreator("TYPO3 CMS")
            ->setTitle($this->translate('workbook_title'))
            ->setSubject($this->translate('workbook_title'))
            ->setDescription($this->translate('workbook_description') . date('d. m. Y'));

        $phpExcel->setActiveSheetIndex(0);
    }

    protected function xlsData($phpExcel, $pageID)
    {
        $sheet = $phpExcel->getActiveSheet();
        $sheet->setTitle($this->translate('workbook_title'));

        $data = $this->getDbData($pageID);

        $col = 0;
        $row = 0;

        // Format der Spaltenköpfe
        $format_head = array(
            'font' => array(
                'bold' => true,
            ),
            'alignment' => array(
                'horizontal' => \PHPExcel_Style_Alignment::HORIZONTAL_CENTER,
                'vertical' => \PHPExcel_Style_Alignment::VERTICAL_CENTER,
            ),
            'borders' => array(
                'outline' => array(
                    'style' => \PHPExcel_Style_Border::BORDER_THIN,
                    'color' => array('rgb' => '000000'),
                ),
            ),
            'fill' => array(
                'type' => \PHPExcel_Style_Fill::FILL_SOLID,
                'color' => array('rgb' => '999999'),
            ),
        );

        $format_body = array(
            'alignment' => array(
                'horizontal' => \PHPExcel_Style_Alignment::HORIZONTAL_LEFT,
                'vertical' => \PHPExcel_Style_Alignment::VERTICAL_TOP,
            ),
            'borders' => array(
                'outline' => array(
                    'style' => \PHPExcel_Style_Border::BORDER_THIN,
                    'color' => array('rgb' => '000000'),
                ),
            ),
        );

        // Spalten im Export => Breite (oder "auto")
        $export_cols = array(
            'timestamp' => 17,
            'username' => 'auto',
            'email' => 'auto',
            'excerpt' => 40,
            'comment' => 40,
            'likes' => 15,
            'dislikes' => 15,
            'avg' => 15,
        );

        // Kopf
        foreach ($export_cols as $spalte => $breite) {
            $sheet->getCellByColumnAndRow($col, 1)
                ->setValueExplicit($this->translate('col_' . $spalte), \PHPExcel_Cell_DataType::TYPE_STRING);

            $col++;
        }

        $sheet->getStyle('A1:' . \PHPExcel_Cell::stringFromColumnIndex(count($export_cols) - 1) . '1')
            ->applyFromArray($format_head);

        // Daten
        foreach ($data as $row => $dataRow) {
            $col = 0;

            foreach ($export_cols as $dbName => $breite) {
                // je nach Typ als String, Integer oder Formel
                // wenn der Wert leer ist, dann natürlich gar nix
                if (isset($dataRow[$dbName])) {
                    // Textauszug hat Sonderbehandlung
                    if ($dbName == 'excerpt') {
                        $arr = $this->getTextExcerpt($dataRow['id'], $pageID);

                        if (is_array($arr) && count($arr)) {
                            $content = new \PHPExcel_RichText();

                            $content->createText('...' . $arr['before'] . ' ');

                            if (!empty($arr['comment'])) {
                                $selection = $content->createTextRun($arr['comment']);

                                $selection->getFont()->setBold(true);
                                $selection->getFont()->setItalic(true);
                                $selection->getFont()->setColor(new \PHPExcel_Style_Color(\PHPExcel_Style_Color::COLOR_RED));
                            }

                            $content->createText(' ' . $arr['after'] . '...');

                            $sheet->getCellByColumnAndRow($col, $row + 2)
                                ->setValue($content);
                        }

                        $col++;
                        continue;

                    } elseif ($dbName == 'timestamp') {
                        $content = date('d.m.Y H:i', $dataRow[$dbName]);
                    } else {
                        $content = $dataRow[$dbName];
                    }

                    $dataType = is_numeric($content)
                    ? \PHPExcel_Cell_DataType::TYPE_NUMERIC
                    : \PHPExcel_Cell_DataType::TYPE_STRING;
                } elseif ($dbName == 'avg') {
                    $content = '=$F' . ($row + 2) . '-$G' . ($row + 2);

                    $dataType = \PHPExcel_Cell_DataType::TYPE_FORMULA;
                } else {
                    $col++;
                    continue;
                }

                $sheet->getCellByColumnAndRow($col, $row + 2)
                    ->setValueExplicit($content, $dataType);

                $col++;
            }
        }

        // Spaltenbreiten
        $col = 0;

        foreach ($export_cols as $spalte => $breite) {
            if ($breite == 'auto') {
                $sheet->getColumnDimensionByColumn($col)->setAutoSize(true);
            } else {
                $sheet->getColumnDimensionByColumn($col)->setWidth($breite);
            }

            $col++;
        }

        // Formatierung Datenpart
        $sheet->getStyle('A2:' . \PHPExcel_Cell::stringFromColumnIndex(count($export_cols) - 1) . (count($data) + 1))
            ->applyFromArray($format_body);

        $sheet->getStyle('A1:' . \PHPExcel_Cell::stringFromColumnIndex(count($export_cols) - 1) . (count($data) + 1))
            ->getAlignment()->setWrapText(true);
    }

    protected function getDbData($pageID)
    {
        $select = 'c.uid AS id, c.Content AS comment, c.CommentedText AS excerpt, c.crdate AS timestamp,
					(SELECT COUNT(v1.uid) FROM tx_webetatext_vote v1 WHERE v1.CommentID=c.uid AND v1.Value= 1) AS likes,
					(SELECT COUNT(v2.uid) FROM tx_webetatext_vote v2 WHERE v2.CommentID=c.uid AND v2.Value=-1) AS dislikes,
					u.name AS username,
					u.email,
					u.tx_webetatext_verified AS userverified';

        $table = 'tx_webetatext_comment c LEFT JOIN fe_users u ON u.uid=c.fe_cruser_id';

        $where = 'c.pid="' . intval($pageID) . '" AND c.hidden=0 AND c.deleted=0 AND c.TextVersion<>0';

        return $GLOBALS['TYPO3_DB']->exec_SELECTgetRows($select, $table, $where, '', 'EndIndex, StartIndex');
    }

    protected function getTextExcerpt($commentid, $pageID)
    {
        static $Text = null;

        if ($Text === null) {
            $res = $GLOBALS['TYPO3_DB']->exec_SELECTgetSingleRow('Content', 'tx_webetatext_text', 'pid=' . intval($pageID));

            $Text = trim(preg_replace('~\s+~', ' ', $res['Content']));
            $Text = preg_replace('~<!--.*-->~U', '', $Text);
        }

        \phpQuery::newDocument($Text, 'text/html');

        foreach (pq('span.savedComment') as $comment) {
            if (!pq($comment)->hasClass('comment-' . $commentid)) {
                pq($comment)->replaceWith(pq($comment)->contents());
            }

        }

        $rawResult = \phpQuery::getDocument();

        // jetzt noch Text in den Abschnitt vor und nach der Markierung splitten
        if (preg_match('~(.*)<span[^>]*class="savedComment [^>]+>(.*)</span>(.*)~sm', $rawResult, $matches)) {
            $matches = array_map('strip_tags', $matches);

            $strip_length = max(50, (300 - mb_strlen($matches[2])) / 2);

            $ret = array(
                'before' => $this->truncate($matches[1], $strip_length, 'end'),
                'comment' => $matches[2],
                'after' => $this->truncate($matches[3], $strip_length, 'beginning'),
            );

            return $ret;
        } else {
            return false;
        }

    }

    protected function truncate($text, $length, $keep = 'beginning')
    {
        $temp = preg_split('~\s+~', $text);

        $string = '';

        while (mb_strlen($string) < $length) {
            if ($keep == 'beginning') {
                $string .= ' ' . array_shift($temp);
            } else {
                $string = array_pop($temp) . ' ' . $string;
            }
        }

        return trim($string);
    }

    protected function translate($key)
    {
        //      if (is_null($this->localization)) {
        // $this->localization = $objectManager->get(TYPO3\CMS\Extbase\Utility\LocalizationUtility::class);
        //      }
        return \TYPO3\CMS\Extbase\Utility\LocalizationUtility::translate($key, 'WeBetatext');
    }
}

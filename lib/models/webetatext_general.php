<?php

class webetatext_general
{
	var $table;
	var $keep_fields     = array();
	var $request_methods = array();

	function __construct()
	{
		$this -> table = 'tx_' . get_class ( $this );
	}

	// SELECT
	public function get ( $id )
	{
		return $this -> error ( 405 );
	}

	// DELETE
	public function delete ( $uid )
	{
		return $this -> error ( 405 );
	}

	// INSERT
	public function post()
	{
		return $this -> error ( 405 );
	}

	// UPDATE
	public function put ( $id )
	{
		return $this -> error ( 405 );
	}

	/****************************************
	 *     H E R E   B E   D R A G O N S
	 ****************************************/

	/**
	 * holt die Daten des Requests aus der Slim-Environment
	 */
	protected function getData()
	{
		global $we_betatext;

		$env = $we_betatext -> environment();

		return (array) json_decode ( $env [ 'slim.input' ] );
	}

	/**
	 * einzelnen Datensatz aus der Datenbank holen
	 *
	 * @param String $where WHERE-Klausel
	 * @return Array oder Boolean
	 */
	protected function selectSingle ( $where )
	{
		$where .= ' AND hidden=0 AND deleted=0';

		return $GLOBALS [ 'TYPO3_DB' ] -> exec_SELECTgetSingleRow ( '*', $this -> table, $where );
	}

	/**
	 * Datensatz aufbereiten, indem überflüssige Felder entfernt werden
	 *
	 * @param Array $data aufgeräumter Datensatz
	 */
	protected function cleanup ( &$data )
	{
		if ( !is_array ( $data ) )
			return;

		foreach ( $data as $key => $value )
			if ( !in_array ( $key, $this -> keep_fields ) )
				unset ( $data [ $key ] );
	}

	/**
	 * PID zu bestehender CO-ID ermitteln
	 *
	 * @param String $co_id aus CO-ID eine PID ermitteln
	 * @return Integer PID
	 */
	protected function getPID ( $co_id )
	{
		// zunächst aus der String-ID eine vernünftige UID erzeugen
		$uid = preg_replace ( '~[^0-9]*~', '', $co_id );

		if ( empty ( $uid ) )
			return 0;

		$res = $GLOBALS [ 'TYPO3_DB' ] -> exec_SELECTgetSingleRow ( 'pid', 'tt_content', 'uid=' . $uid );

		if ( !is_array ( $res ) )
			return 0;

		return $res [ 'pid' ];
	}

	/**
	 * Anpassungen vor einem Datenbank-Speichervorgang
	 *
	 * @param Array $data Datensatz
	 * @param Boolean $create INSERT oder UPDATE
	 */
	protected function beforeSave ( &$data, $create = false )
	{
		$this -> cleanup ( $data );

		$data [ 'tstamp' ] = time();

		if ( $create )
		{
			$data [ 'crdate' ] = time();

			if ( is_array ( $GLOBALS [ 'user' ] -> user ) )
				$data [ 'fe_cruser_id' ] = $GLOBALS [ 'user' ] -> user [ 'uid' ];

			if ( $data [ 'TextID' ] )
				$data [ 'pid' ] = $this -> getPID ( $data [ 'TextID' ] );
		}
	}

	/**
	 * vor einer Rückgabe noch ID übersetzen (Typo3-UID in ID)
	 *
	 * @param Array $data Rückgabe-Array
	 */
	protected function beforeReturn ( &$data )
	{
		if ( isset ( $data [ 'uid' ] ) )
		{
			$data [ 'id' ] = intval ( $data [ 'uid' ] );

			unset ( $data [ 'uid' ] );
		}
	}

	/**
	 * Erfolgreiche Rückgabe:
	 * bereitet Rückgabe auf (überflüssige Felder entfernen, ID übersetzen)
	 *
	 * @param Mixed $body Rückgabe (i.d.R. ein Array)
	 * @return aufbereitete Rückgabe
	 */
	protected function success ( $body )
	{
		if ( is_array ( $body ) )
		{
			$this -> beforeReturn ( $body );
			$this -> cleanup      ( $body );
		}

		return $body;
	}

	/**
	 * Fehlerrückgabe
	 *
	 * @param Integer $code HTTP-Statuscode
	 * @param Mixed $body Boolean, String oder Array
	 * @return false
	 */
	protected function error ( $code, $body = null )
	{
		global $we_betatext;

		if ( is_array ( $body ) )
		{
			$this -> cleanup ( $body );

			$body = json_encode ( $body );
		}
		elseif ( $body === null )
		{
			switch ( $code )
			{
				case 302: $body = 'Found'; break;
				case 303: $body = 'See Other'; break;
				case 400: $body = 'Bad Request'; break;
				case 401: $body = 'Unauthorized'; break;
				case 403: $body = 'Forbidden'; break;
				case 404: $body = 'Not Found'; break;
				case 405: $body = 'Method Not Allowed'; break;
				case 409: $body = 'Conflict'; break;
				case 500: $body = 'Internal Server Error'; break;
			}
		}

		$we_betatext -> response() -> body ( $body );
		$we_betatext -> status ( $code );

		return false;
	}

	/**
	 * bestimmen, ob ein korrekter Nutzer eingeloggt ist
	 *
	 * @return Boolean
	 */
	protected function loggedIn()
	{
		if ( is_array ( $GLOBALS [ 'user' ] -> user ) )
		{
			// Gruppe checken
			$groups = explode ( ',', $GLOBALS [ 'user' ] -> user [ 'usergroup' ] );

			if ( in_array ( $this -> getConfigOption ( 'groupID' ), $groups ) )
				return true;
		}

		return false;
	}

	/**
	 * bestimmen, ob das Beteiligungstool aktiv oder nur "read only" ist
	 *
	 * @param String $TextID Text-ID
	 * @return Boolean
	 */
	protected function toolEnabled ( $TextID = null )
	{
		if ( $TextID === null )
		{
			$data = $this -> getData();

			$pid = $this -> getPID ( $data [ 'TextID' ] );
		}
		else
			$pid = $this -> getPID ( $TextID );

		if ( !empty ( $pid ) )
		{
			$page = $GLOBALS [ 'TYPO3_DB' ] -> exec_SELECTgetSingleRow ( 'doktype, tx_webetatext_enable', 'pages', 'uid='.$pid . ' AND hidden=0 AND deleted=0' );

			if ( is_array ( $page ) && $page [ 'doktype' ] == $this -> getConfigOption ( 'dokType' ) && $page [ 'tx_webetatext_enable' ] == 1 )
				return true;
		}

		return false;
	}

	/**
	 * leeres Logo durch Default-Logo ersetzen
	 *
	 * @param String $logo
	 */
	protected function userLogo ( &$logo )
	{
		$logo = trim ( $logo );
		if ( empty ( $logo ) )
			$logo = $this -> getConfigOption ( 'defaultLogo' );
		else
		{
			$this->getTSFE();

			$imgTSConfig = Array();
            $imgTSConfig['file'] = 'uploads/tx_srfeuserregister/'.$logo;
            $imgTSConfig['file.']['width'] = '38c';
			$imgTSConfig['file.']['height'] = '38c';
			$this->cObj = t3lib_div::makeInstance("tslib_cObj");
			$logo = $this->cObj->IMG_RESOURCE($imgTSConfig);
		}
	}

	/**
	 * holt eine einzelne Option aus der Extension-Config
	 *
	 * @param String $confkey Konfigurationsschlüssel
	 * @return String
	 */
	protected function getConfigOption ( $confkey )
	{
		$extConfig = unserialize ( $GLOBALS ['TYPO3_CONF_VARS' ][ 'EXT' ][ 'extConf' ][ 'we_betatext' ] );
		return $extConfig [ $confkey ];
	}

	protected function getRealURL($pid,$params=array()) {
        $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery('*', 'pages', 'uid = ' . (int) $pid);
        $pagerow = $GLOBALS['TYPO3_DB']->sql_fetch_assoc($res);
        if($pagerow === false ) {
            $url = "";
        } else {
			$this->getTSFE();
			require_once(t3lib_extMgm::extPath('realurl').'class.tx_realurl.php');
       		$this->realurl = t3lib_div::makeInstance('tx_realurl');
            $conf['LD'] = $GLOBALS['TSFE']->tmpl->linkData($pagerow, '', 0, 'index.php', '', t3lib_div::implodeArrayForUrl('', $params));
            $this->realurl->encodeSpURL($conf, $this);
            $this->realurl_linkdata = $conf['LD'];
            $url = $conf['LD']['totalURL'];
        }
        return $url;
    }
	protected function getTSFE() {
		if ( !isset($GLOBALS['TSFE']))
		{
			$GLOBALS['TSFE'] = t3lib_div::makeInstance('tslib_fe',$GLOBALS ['TYPO3_CONF_VARS' ], 0, '0', 1, '','','','');
			$GLOBALS['TSFE']->initFEuser();
			$GLOBALS['TSFE']->fetch_the_id();
			$GLOBALS['TSFE']->getPageAndRootline();
			$GLOBALS['TSFE']->initTemplate();
			$GLOBALS['TSFE']->getConfigArray();
		}
	}
}

?>
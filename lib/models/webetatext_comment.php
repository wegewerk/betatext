<?php

require_once BBT_restpath . '/models/webetatext_general.php';

class webetatext_comment extends webetatext_general
{
	var $keep_fields = array ( 'id', 'ctime', 'TextID', 'Content', 'CommentedText', 'StartIndex', 'EndIndex' );

	/**
	 * einzelnen Kommentar abrufen
	 *
	 * @param Integer $id Kommentar-ID
	 * @return Array oder Fehler
	 */
	public function get ( $id )
	{
		$res = $this -> getComments ( 'c.uid=' . $id );

		if ( is_array ( $res ) )
			return $this -> success ( $res );
		else
			return $this -> error ( 404 );
	}

	/**
	 * einzelnen Kommentar anlegen
	 *
	 * @return Array mit Kommentardaten oder Fehler
	 */
	public function post()
	{
		if ( !$this -> toolEnabled() )
			return $this -> error ( 403 );

		if ( !$this -> loggedIn() )
			return $this -> error ( 401 );

		$data = $this -> getData();

		$this -> beforeSave ( $data, true );

		if ( $GLOBALS [ 'TYPO3_DB' ] -> exec_INSERTquery ( $this -> table, $data ) )
		{
			$data [ 'id' ] = $GLOBALS [ 'TYPO3_DB' ] -> sql_insert_id();

			$this -> sendInfoMail ( $data [ 'id' ] );

			return $this -> success ( $data );
		}
		else
			return $this -> error ( 500, 'Error Inserting Into Database' );
	}

	/**
	 * Liste aller Kommentare zu einem Text abrufen
	 *
	 * @param String $TextID Text-ID
	 * @return Array Kommentarliste oder Fehler
	 */
	public function commentlist ( $TextID )
	{
		$res = $this -> getComments ( 'c.TextID="' . $TextID . '"', true );

		if ( is_array ( $res ) && count ( $res ) )
		{
			// hier kann nicht die Standard-Successmethode ran,
			// weil wir hier einen Array von Datensätzen haben

			foreach ( $res as &$ds )
			{
				$this -> beforeReturn ( $ds );
				$this -> cleanup      ( $ds );

			}

			return $res;
		}
		else
			return $this -> error ( 404 );
	}

	/**
	 * Meta-Funktion zum Abrufen von Kommentaren (einzeln oder als Liste)
	 *
	 * @param String $where WHERE-Clause (SQL)
	 * @param Boolean $list Liste oder einzelner Kommentar?
	 * @return Array Kommentar oder Kommentarliste
	 */
	private function getComments ( $where, $list = false )
	{
		// weitere Felder werden spannend
		$this -> keep_fields[] = 'User';
		$this -> keep_fields[] = 'Likes';
		$this -> keep_fields[] = 'Dislikes';
		$this -> keep_fields[] = 'UserVote';

		$select = 'c.uid AS id, c.crdate AS ctime, TextID, Content, StartIndex, EndIndex,
					(SELECT COUNT(v1.uid) FROM tx_webetatext_vote v1 WHERE v1.CommentID=c.uid AND v1.Value= 1) AS Likes,
					(SELECT COUNT(v2.uid) FROM tx_webetatext_vote v2 WHERE v2.CommentID=c.uid AND v2.Value=-1) AS Dislikes,
					u.name AS user_Name, u.image AS user_Logo, u.tx_webetatext_verified AS user_Verified';

		$table  = $this -> table . ' c LEFT JOIN fe_users u ON u.uid=c.fe_cruser_id';

		if ( $this -> loggedIn() )
		{
			$select .= ', CASE WHEN v.Value IS NOT NULL THEN v.Value ELSE "0" END AS UserVote';
			$table  .= ' LEFT JOIN tx_webetatext_vote v ON c.uid=v.CommentID AND v.fe_cruser_id=' . $GLOBALS['TSFE']->fe_user[ 'uid' ];
		}
		else
			$select .= ', "0" AS UserVote';

		$where .= ' AND c.hidden=0 AND c.deleted=0 AND c.TextVersion<>0';

		if ( $list )
			return $GLOBALS [ 'TYPO3_DB' ] -> exec_SELECTgetRows ( $select, $table, $where );
		else
			return $GLOBALS [ 'TYPO3_DB' ] -> exec_SELECTgetSingleRow ( $select, $table, $where );
	}

	/**
	 * Kommentar löschen per Authlink
	 *
	 * @param Integer $CommentID Kommentar-UID
	 * @param String $AuthHash Authentifizierungs-Hash
	 */
	public function deleteComment ( $CommentID, $AuthHash )
	{
		if ( $this -> getAuthHash ( $CommentID ) == $AuthHash )
		{
			$res = $GLOBALS [ 'TYPO3_DB' ] -> exec_SELECTgetSingleRow ( 'pid', $this -> table, 'uid=' . intval ( $CommentID ) );

			if ( $GLOBALS [ 'TYPO3_DB' ] -> exec_DELETEquery ( $this -> table, 'uid=' . intval ( $CommentID ) ) )
			{
				header ( 'Location: /index.php?id=' . intval ( $res [ 'pid' ] ) );

				return $this -> error ( 303 );
			}
		}

		return $this -> error ( 500 );
	}

	/**
	 * Informationsmail an Redakteur schicken bei neuem Kommentar
	 *
	 * @param Array $data Kommentar-Daten
	 */
	private function sendInfoMail ( $CommentID )
	{
		$table  = $this -> table . ' c LEFT JOIN fe_users u ON u.uid=c.fe_cruser_id';

		$data = $GLOBALS [ 'TYPO3_DB' ] -> exec_SELECTgetSingleRow ( 'c.*, u.name, u.username', $table, 'c.uid=' . intval ( $CommentID ) );

		if ( !is_array ( $data ) )
			return false;

		$AuthHash = $this -> getAuthHash ( $data [ 'uid' ] );
		if ( $AuthHash === false )
			return false;

		$rep = array();

		// Platzhalter in der Mail: die Links
		$rep [ '%%%VIEW_PAGE%%%'      ] = t3lib_div::locationHeaderUrl ( '/index.php?id='        . intval ( $data [ 'pid' ] ) );
		$rep [ '%%%DELETE_COMMENT%%%' ] = t3lib_div::locationHeaderUrl ( '/rest.php/delcomment/' . intval ( $data [ 'uid' ] ) . '/' . $AuthHash );

		// weitere Platzhalter
		$rep [ '%%%COMMENT%%%'   ] = $data [ 'Content'       ];
		$rep [ '%%%SELECTION%%%' ] = $data [ 'CommentedText' ];
		$rep [ '%%%USERNAME%%%'  ] = $data [ 'username'      ];
		$rep [ '%%%NAME%%%'      ] = $data [ 'name'          ];

		if ( !is_readable ( BBT_restpath . '/../template/infomail.txt' ) )
			return false;

		$mailtext = file_get_contents ( BBT_restpath . '/../template/infomail.txt' );

		// erste Zeile ist Betreff
		$mailtext = explode ( "\n", $mailtext );
		$subject = array_shift ( $mailtext );
		$mailtext = implode ( "\n", $mailtext );

		$mailtext = wordwrap ( strtr ( $mailtext, $rep ) );

		// Mailempfänger in der Seite ?
		$page = $GLOBALS [ 'TYPO3_DB' ] -> exec_SELECTgetSingleRow ( 'tx_webetatext_infomail_to as mailto, pid', 'pages', 'uid=' .  $data [ 'pid' ]  );
		if( $page['mailto'] != '' ) $mailto = $page['mailto'];
		if( $mailto == '' ) {
			// mailto eingetragen?
			$parentpage = $GLOBALS [ 'TYPO3_DB' ] -> exec_SELECTgetSingleRow ( 'tx_webetatext_infomail_to as mailto', 'pages', 'uid=' .  $page [ 'pid' ]  );
			if( $parentpage['mailto'] != '' ) $mailto = $parentpage['mailto'];
		}


		// kein mailto -> aus Config holen
		if( $mailto == '' ) $mailto = $this -> getConfigOption ( 'infomail_to' );

		t3lib_div::plainMailEncoded ( $mailto,
		                              $subject,
		                              $mailtext,
		                              'From: ' . $this -> getConfigOption ( 'infomail_from' ) );

		return true;
	}


	/**
	 * AuthHash für einen Kommentar erzeugen
	 *
	 * @param Integer $CommentID Kommentar-UID
	 * @return Hash oder false
	 */
	private function getAuthHash ( $CommentID )
	{
		$res = $GLOBALS [ 'TYPO3_DB' ] -> exec_SELECTgetSingleRow ( '*', $this -> table, 'uid=' . intval ( $CommentID ) );

		if ( is_array ( $res ) )
			return substr ( md5 ( $res [ 'pid' ] . $res [ 'crdate' ] . $this -> getConfigOption ( 'authhash_salt' ) . $res [ 'Content' ] . $res [ 'fe_cruser_id' ] ), 13, 8 );
		else
			return false;
	}

	/****************************************
	 *     H E R E   B E   D R A G O N S
	 ****************************************/

	protected function beforeReturn ( &$data )
	{
		foreach ( $data as $key => $val )
		{
			if ( strncmp ( 'user_', $key, 5 ) === 0 )
			{
				if( $key == 'user_Verified' )  $val = intval($val);
				$data [ 'User' ][ substr ( $key, 5 ) ] = $val;

				unset ( $data [ $key ] );
			}

			if ( $key == 'id' || $key == 'Likes' || $key == 'Dislikes' || $key == 'UserVote' )
				$data [ $key ] = intval ( $val );
		}

		// Default Image URL
		$this -> userLogo ( $data [ 'User' ][ 'Logo' ] );

		parent::beforeReturn ( $data );
	}

	protected function beforeSave ( &$data, $create = false )
	{
		parent::beforeSave ( $data, $create );

		// maximal 700 Zeichen speichern: hart abschneiden
		$data [ 'Content' ] = substr ( $data [ 'Content' ], 0, 700 );
	}
}

?>
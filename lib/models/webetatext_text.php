<?php

require_once BBT_restpath . '/models/webetatext_general.php';

class webetatext_text extends webetatext_general
{
	var $keep_fields = array ( 'TextID', 'Version', 'Content' );

	/**
	 * Text anhand der Text-ID abrufen (mitsamt gespeicherter Markierungen)
	 *
	 * @param String $TextID Text-ID
	 * @return Array Text oder Fehler
	 */
	public function get ( $TextID )
	{
		$res = $this -> selectSingle ( 'TextID="'.$TextID.'"' );

		if ( is_array ( $res ) )
			return $res;
		else
			return $this -> error ( 404 );
	}

	/**
	 * Text anlegen oder aktualisieren (hier beides mit PUT)
	 *
	 * @param String $TextID Text-ID
	 * @todo prüfen, ob alle Kommentare mit kleineren Versionsnummern enthalten sind und den gleichen Text markieren
	 * @return Array Text oder Fehler
	 */
	public function put ( $TextID )
	{
		if ( !$this -> toolEnabled ( $TextID ) )
			return $this -> error ( 403 );

		if ( !$this -> loggedIn() )
			return $this -> error ( 401 );

		$data = $this -> getData();

		if ( $TextID != $data [ 'TextID' ] )
			return $this -> error ( 500, 'ID Mismatch' );

		$where = 'TextID="'. $TextID .'"';

		// prüfen, ob es den Text schon gibt (TextID bereits vorhanden)
		$res = $this -> selectSingle ( $where );

		if ( is_array ( $res ) )
		{
			// Version vergleichen
			if ( !isset ( $data [ 'Version' ] ) || $res [ 'Version' ] != $data [ 'Version' ] )
				return $this -> error ( 409, $res );
			
			$text_ok = $this -> normalizeText ( $res [ 'Content' ] ) == $this -> normalizeText ( $data [ 'Content' ] );
			$comments_ok = $this -> checkComments ( $TextID, $data [ 'Content' ] );
			$newComment_ok = $this -> checkCommentedText($data['Content'] , $data [ 'CommentID' ] );

			// Inhalt abgleichen
			if ( $text_ok && $comments_ok && $newComment_ok )
			{
				// Kommentar-ID aufheben, damit wir beim Kommentar die Version vermerken können
				$CommentID = $data [ 'CommentID' ];

				$this -> beforeSave ( $data );

				if ( !$GLOBALS [ 'TYPO3_DB' ] -> exec_UPDATEquery ( $this -> table, $where, $data ) )
					return $this -> error ( 500, 'Error Updating Database' );
				else
				{
					$this -> saveVersionToComment ( $CommentID, $data [ 'Version' ] );

					return $this -> success ( $data );
				}
			}
			else {
				$msg = 'Manipulations in';
				if( !$text_ok ) $msg .= " Text";
				if( !$comments_ok ) $msg .= " Selections";
				return $this -> error ( 400,  $msg);
			}
		}

		// Text noch nicht vorhanden: CREATE

		$this -> beforeSave ( $data, true );

		$data [ 'ContentRaw' ] = $data [ 'Content' ];

		if ( $GLOBALS [ 'TYPO3_DB' ] -> exec_INSERTquery ( $this -> table, $data ) )
			return $this -> success ( $data );
		else
			return $this -> error ( 500, 'Error Inserting Into Database' );
	}

	/**
	 * Kommentar mit der Text-Version versehen, mit der die Speicherung letztlich vollzogen wurde
	 *
	 * @param Integer $CommentID ID des zu aktualisierenden Kommentars
	 * @param Integer $TextVersion Text-Versionsnummer
	 */
	private function saveVersionToComment ( $CommentID, $TextVersion )
	{
		$data = array ( 'TextVersion' => $TextVersion );

		$where = 'uid=' . intval ( $CommentID );

		$GLOBALS [ 'TYPO3_DB' ] -> exec_UPDATEquery ( 'tx_webetatext_comment', $where, $data );

		return;
	}

	private function checkComments ( $TextID, $Content )
	{
		require_once BBT_restpath . '/phpQuery/phpQuery.php';

		phpQuery::newDocument ( $Content, 'text/html' );

		// erstmal die relevanten Daten aller Kommentare holen
		$comments = $GLOBALS [ 'TYPO3_DB' ] -> exec_SELECTgetRows ( 'uid, CommentedText', 'tx_webetatext_comment', 'TextID="' . $TextID . '" AND deleted="0" AND hidden="0" and TextVersion > 0' );

		foreach ( $comments as $comment )
		{
			$CommentedText = '';

			// jeden Kommentar im Textinhalt suchen
			foreach ( pq ( 'span.comment-' . $comment [ 'uid' ] ) as $selection )
				$CommentedText .= pq ( $selection ) -> html();

			$SelectedText_norm  = $this -> normalizeText ( $CommentedText );
			$CommentedText_norm = $this -> normalizeText ( $comment [ 'CommentedText' ] );
			debug::log("vergleiche selection: \n".$SelectedText_norm."\nund kommentierter text\n".$CommentedText_norm);

			if (  $SelectedText_norm != $CommentedText_norm ) {
				debug::log('fail. Last comment was:'.$comment [ 'uid' ]);
				return false;
			}
		}

		return true;
	}

	private function checkCommentedText( $text, $CommentID ) {
		$comment = $GLOBALS [ 'TYPO3_DB' ] -> exec_SELECTgetSingleRow ( 'CommentedText', 'tx_webetatext_comment', 'uid=' . $CommentID );
		require_once BBT_restpath . '/phpQuery/phpQuery.php';
		phpQuery::newDocument ( $text, 'text/html' );
		foreach ( pq ( 'span.comment-' . $CommentID ) as $selection )
			$CommentedText .= pq ( $selection ) -> html();

		$SelectedText_norm  = $this -> normalizeText ( $CommentedText );
		$CommentedText_norm = $this -> normalizeText ( $comment [ 'CommentedText' ] );
		if (  $SelectedText_norm != $CommentedText_norm ) {
			debug::log('fail. Neuer Kommentar ist nicht im geschickten Text enthalten');
			return false;
		}
		return true;
	}

	/****************************************
	 *     H E R E   B E   D R A G O N S
	 ****************************************/

	private function normalizeText ( $text )
	{
		// alles HTML wegwerfen
		$text = strip_tags ( $text );

		// allen Whitespace entfernen
		$text = preg_replace ( '~\s+~', '', $text );

		return $text;
	}

	protected function beforeSave ( &$data, $create = false )
	{
		if ( !$create )
			$data [ 'Version' ]++;

		parent::beforeSave ( $data, $create );
	}
}

?>
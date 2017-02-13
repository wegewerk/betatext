<?php

require_once BBT_restpath . '/models/webetatext_general.php';

class webetatext_vote extends webetatext_general
{
	var $keep_fields = array ( 'CommentID', 'Value' );

	/**
	 * einzelnen Kommentar bewerten
	 *
	 * @return Array mit Kommentardaten oder Fehler
	 */
	public function post()
	{
		$data = $this -> getData();

		// weil wir nur über den Kommentar mit dem Text verknüpft sind,
		// schreiben wir die TextID hier mal mit rein

		$data [ 'TextID' ] = $this -> getTextID ( $data [ 'CommentID' ] );

		if ( !$this -> toolEnabled ( $data [ 'TextID' ] ) )
			return $this -> error ( 403 );

		if ( !$this -> loggedIn() )
			return $this -> error ( 401 );

		$this -> beforeSave ( $data, true );

		$where = 'CommentID=' . $data [ 'CommentID' ] . ' AND fe_cruser_id=' . $GLOBALS['TSFE']->fe_user -> user [ 'uid' ];

		// haben wir von diesem User für diesen Kommentar schon eine Bewertung?
		$vote = $this -> selectSingle ( $where );

		if ( is_array ( $vote ) )
		{
			// UPDATE
			if ( $GLOBALS [ 'TYPO3_DB' ] -> exec_UPDATEquery ( $this -> table, $where, $data ) )
			{
				$data = $this -> getLikesDislikes ( $data );

				return $this -> success ( $data );
			}
			else
				return $this -> error ( 500, 'Error Updating Database' );
		}
		else
		{
			if ( $GLOBALS [ 'TYPO3_DB' ] -> exec_INSERTquery ( $this -> table, $data ) )
			{
				$data = $this -> getLikesDislikes ( $data );

				return $this -> success ( $data );
			}
			else
				return $this -> error ( 500, 'Error Inserting Into Database' );
		}
	}

	protected function getTextID ( $comment_id )
	{
		if ( empty ( $comment_id ) )
			return 0;

		$res = $GLOBALS [ 'TYPO3_DB' ] -> exec_SELECTgetSingleRow ( 'TextID', 'tx_webetatext_comment', 'uid=' . $comment_id );

		if ( !is_array ( $res ) )
			return 0;

		return $res [ 'TextID' ];
	}

	/**
	 * da wir keine TextID speichern, diese aber für die PID-Bestimmung und merken...
	 *
	 * @param Array $data
	 * @param Boolean $create Anlegen oder Updaten
	 */
	protected function beforeSave ( &$data, $create = false )
	{
		if ( $create )
			$pid = $this -> getPID ( $data [ 'TextID' ] );

		parent::beforeSave ( $data, $create );

		if ( $create )
			 $data [ 'pid' ] = $pid;
	}

	private function getLikesDislikes ( $data )
	{
		// wir senden was ganz anderes zurück als wir bekommen haben
		$this -> keep_fields = array ( 'Likes', 'Dislikes', 'UserVote' );

		$votes = $GLOBALS [ 'TYPO3_DB' ] -> exec_SELECTgetRows ( 'COUNT(uid) AS Amount, Value', $this -> table, 'CommentID=' . $data [ 'CommentID' ], 'Value', 'Value' );

		$data = array ( 'UserVote' => $data [ 'Value' ],
		                'Likes'    => 0,
		                'Dislikes' => 0 );

		if ( is_array ( $votes ) )
			foreach ( $votes as $vote )
				if ( $vote [ 'Value' ] == -1 )
					$data [ 'Dislikes' ] = intval ( $vote [ 'Amount' ] );
				else
					$data [ 'Likes'    ] = intval ( $vote [ 'Amount' ] );

		return $data;
	}
}

?>
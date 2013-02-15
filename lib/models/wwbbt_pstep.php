<?php

require_once BBT_restpath . '/models/webetatext_general.php';

class webetatext_pstep extends webetatext_general
{
	var $keep_fields = array ( 'id', 'TextID', 'StepIndex', 'Content','IsCurrent','Link', 'IsPast','ProcessTitle');

	function __construct()
	{
		$this -> table = 'tx_webetatext_process';
	}

	/**
	 * einzelnen Prozessschritt abrufen
	 *
	 * @param Integer $id Schritt-ID
	 * @return Array oder Fehler
	 */
	public function get ( $id )
	{
		$res = $this -> getPsteps ( 's.uid=' . $id );

		if ( is_array ( $res ) )
			return $this -> success ( $res );
		else
			return $this -> error ( 404 );
	}

	/**
	 * Liste aller Prozessschritte zu einem Text abrufen
	 *
	 * @param String $TextID Text-ID
	 * @return Array Schrittliste oder Fehler
	 */
	public function steplist ( $TextID )
	{
		$TextID = str_replace('bbt-c', '', $TextID);
		$res = $this -> getPsteps ( 't.uid="' . $TextID . '"', true );

		if ( is_array ( $res ) && count ( $res ) )
		{
			// hier kann nicht die Standard-Successmethode ran,
			// weil wir hier einen Array von Datensätzen haben
			foreach ( $res as &$ds )
			{
				$this -> beforeReturn ( $ds );
				$this -> cleanup      ( $ds );
			}
			$this->massageData( $res );
			return $res;
		}
		else
			return $this -> error ( 404 );
	}

	/**
	 * Meta-Funktion zum Abrufen von Schritten (einzeln oder als Liste)
	 *
	 * @param String $where WHERE-Clause (SQL)
	 * @param Boolean $list Liste oder einzelner Schritt?
	 * @return Array Kommentar oder Kommentarliste
	 */
	private function getPsteps ( $where, $list = false )
	{
		// schaumermal, ob die Elternseite eine paginierte Seite ist, dann müssen wir
		// den ganzen Kram nämlich von der holen

		$select = 'DISTINCT CASE WHEN r.tx_wwgruenefraktion_pagination = 1 THEN s2.uid       ELSE s.uid       END AS id,
					       CASE WHEN r.tx_wwgruenefraktion_pagination = 1 THEN s2.StepIndex ELSE s.StepIndex END AS StepIndex,
					       CASE WHEN r.tx_wwgruenefraktion_pagination = 1 THEN s2.Content   ELSE s.Content   END AS Content,
					       CASE WHEN r.tx_wwgruenefraktion_pagination = 1 THEN s2.IsCurrent ELSE s.IsCurrent END AS IsCurrent,
					       CASE WHEN r.tx_wwgruenefraktion_pagination = 1 THEN s2.Link      ELSE s.Link      END AS Link,
					       CASE WHEN r.tx_wwgruenefraktion_pagination = 1 THEN r.tx_webetatext_pstep_title ELSE p.tx_webetatext_pstep_title END AS ProcessTitle'
					       ;

		$table  = 'tt_content t';

		if ( $list )
			$table  .= ' LEFT JOIN tx_webetatext_process s  ON s.pid=t.pid
			             LEFT JOIN pages p             ON p.uid=t.pid
			             LEFT JOIN pages r             ON p.pid=r.uid
			             LEFT JOIN tx_webetatext_process s2 ON s2.pid=r.uid';

		$where_complete  = $where . ' AND CASE WHEN r.tx_wwgruenefraktion_pagination = 1 THEN  s2.hidden=0 ELSE  s.hidden=0 END
		             AND CASE WHEN r.tx_wwgruenefraktion_pagination = 1 THEN s2.deleted=0 ELSE s.deleted=0 END';

		if ( $list )
			$psteps = $GLOBALS [ 'TYPO3_DB' ] -> exec_SELECTgetRows ( $select, $table, $where_complete, '', 's.sort, s2.sort' );
		else
			$psteps = $GLOBALS [ 'TYPO3_DB' ] -> exec_SELECTgetSingleRow ( $select, $table, $where_complete );

		if (!$psteps)
		{
			$select = 'DISTINCT s.uid       AS id,
					       s.StepIndex AS StepIndex,
					       s.Content   AS Content,
					       s.IsCurrent AS IsCurrent,
					       s.Link      AS Link,
					       p.tx_webetatext_pstep_title AS ProcessTitle'
					       ;
			$where_complete  = $where . ' AND s.hidden=0 AND s.deleted=0';
			if ( $list )
				$psteps = $GLOBALS [ 'TYPO3_DB' ] -> exec_SELECTgetRows ( $select, $table, $where_complete, '', 's.sort, s2.sort' );
			else
				$psteps = $GLOBALS [ 'TYPO3_DB' ] -> exec_SELECTgetSingleRow ( $select, $table, $where_complete );
		}

		return $psteps;
	}

	protected function beforeReturn ( &$data )
	{
		foreach ( $data as $key => $val )
		{
			if ( $key == 'IsCurrent' || $key == 'id' )
				$data [ $key ] = intval ( $val );

			if( $key == 'Link' )
				$data [ $key ] = $this->getRealURL ( $val );

		}

		parent::beforeReturn ( $data );
	}
	private function massageData( &$data ) {
		$is_past = true;
		foreach ( $data as $key => $step )
		{
			if( $step['IsCurrent'] ) {
				$is_past = false;
			}
			$data [$key]['IsPast'] = $is_past;
		}
	}

}

?>
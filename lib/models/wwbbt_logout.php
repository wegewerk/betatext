<?php

require_once BBT_restpath . '/models/wwbbt_general.php';

class wwbbt_logout extends wwbbt_general
{
	var $keep_fields = array ( 'register_url', 'pwreset_url' );

	/**
	 * Nutzer ausloggen und Session zerstören
	 *
	 * @return Erfolg mit URLs zum Registrieren und "Passwort vergessen"
	 */
	public function post()
	{
		$GLOBALS [ 'TYPO3_DB' ] -> exec_DELETEquery ( 'fe_sessions',
			'ses_id  ="' . $GLOBALS [ 'user' ] -> user [ 'ses_id'   ] . '" AND
			 ses_name="' . $GLOBALS [ 'user' ] -> user [ 'ses_name' ] . '"' );

		$data = array (
			'register_url' => $this -> getConfigOption ( 'url_registration' ),
			'pwreset_url'  => $this -> getConfigOption ( 'url_pwforgot'     )
		);

		return $this -> success ( $data );
	}
}

?>
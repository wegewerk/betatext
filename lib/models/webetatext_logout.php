<?php

require_once BBT_restpath . '/models/webetatext_general.php';

class webetatext_logout extends webetatext_general
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
			'ses_id  ="' . $GLOBALS['TSFE']->fe_user -> user [ 'ses_id'   ] . '" AND
			 ses_name="' . $GLOBALS['TSFE']->fe_user -> user [ 'ses_name' ] . '"' );

		$data = array (
			'register_url' => $this -> getConfigOption ( 'url_registration' ),
			'pwreset_url'  => $this -> getConfigOption ( 'url_pwforgot'     )
		);

		return $this -> success ( $data );
	}
}

?>
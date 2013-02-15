<?php

require_once BBT_restpath . '/models/webetatext_general.php';

class webetatext_user extends webetatext_general
{
	var $keep_fields = array ( 'Name', 'Logo', 'Verified', 'profile_url' );

	/**
	 * eingeloggten User abrufen (daher brauchen wir auch keine ID)
	 *
	 * @param Integer $id brauche mer net
	 * @return Array User oder Fehler
	 */
	public function get ( $id = 'notneeded' )
	{
		// wenn der Nutzer nicht eingeloggt ist (oder in der falschen Gruppe),
		// dann gibt's Links zur Registrierung und zum "Passwort vergessen"
		if ( !$this -> loggedIn() )
		{
			$this -> keep_fields = array ( 'register_url', 'pwreset_url' );

			return $this -> error ( 404, array (
				'register_url' => $this -> getConfigOption ( 'url_registration' ),
				'pwreset_url'  => $this -> getConfigOption ( 'url_pwforgot' )
			) );
		}
		// ansonsten Nutzerdaten
		$data = array ( 'Name'     => $GLOBALS [ 'user' ] -> user [ 'name' ],
		                'Logo'     => $GLOBALS [ 'user' ] -> user [ 'image' ],
		                'Verified' => intval( $GLOBALS [ 'user' ] -> user [ 'tx_webetatext_verified' ] ),
          				'profile_url' => $this -> getConfigOption ( 'url_edit' ) );

		$this -> userLogo ( $data [ 'Logo' ] );

		return $this -> success ( $data );
	}
}

?>
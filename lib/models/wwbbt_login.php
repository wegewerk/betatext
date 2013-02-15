<?php

require_once BBT_restpath . '/models/webetatext_general.php';

class webetatext_login extends webetatext_general
{
	var $keep_fields = array ( 'Name', 'Logo', 'Verified' );

	/**
	 * Nutzer einloggen und Session erzeugen
	 *
	 * @return Array Nutzer oder Fehler
	 */
	public function post()
	{
		$data = $this -> getData();

		if ( !is_array ( $data ) )
			return $this -> error ( 500 );

		$loginData = array (
			'username'    => $data [ 'username' ],
			'uident_text' => $data [ 'password' ],
			'status'      => 'login'
		);

		// PID-Check (bbt-user sollen getrennt sein)
		$GLOBALS [ 'user' ] -> checkPid = true;
		$GLOBALS [ 'user' ] -> checkPid_value = $this -> getConfigOption ( 'userPID' );
		debug::log( 'user checkpid: '.$GLOBALS [ 'user' ] -> checkPid);

		$info = $GLOBALS [ 'user' ] -> getAuthInfoArray();
		debug::log($info);
		$user = $GLOBALS [ 'user' ] -> fetchUserRecord ( $info [ 'db_user' ], $loginData [ 'username' ] );

		if ( isset ( $user ) && $user != '' )
		{
			// User gefunden, jetzt noch Zugangspasswort prüfen
			$authBase = new tx_saltedpasswords_sv1();

			$ok = $authBase -> compareUident ( $user, $loginData );

			if ( $ok )
			{
				$GLOBALS [ 'user' ] -> createUserSession ( $user );

				$data = array ( 'Name'     => $user [ 'name'              ],
				                'Logo'     => $user [ 'tx_webetatext_logo'     ],
				                'Verified' => $user [ 'tx_webetatext_verified' ] );

				$this -> userLogo ( $data [ 'Logo' ] );

				return $this -> success ( $data );
			}

			return $this -> error ( 401, 'Authentication failed' );
		}

		return $this -> error ( 401, 'User not found' );
	}
}

?>
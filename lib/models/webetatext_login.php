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
		$GLOBALS['TSFE']->fe_user -> checkPid = true;
		$GLOBALS['TSFE']->fe_user -> checkPid_value = $this -> getConfigOption ( 'userPID' );
		debug::log( 'user checkpid: '.$GLOBALS['TSFE']->fe_user -> checkPid);

		$info = $GLOBALS['TSFE']->fe_user -> getAuthInfoArray();
		debug::log($info);
		$user = $GLOBALS['TSFE']->fe_user -> fetchUserRecord ( $info [ 'db_user' ], $loginData [ 'username' ] );
		// debug::log($user);

		if ( isset ( $user ) && $user != '' )
		{
			// User gefunden, jetzt noch Zugangspasswort prüfen
			$authBase = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(TYPO3\CMS\Saltedpasswords\SaltedPasswordService::class);

			$ok = $authBase -> compareUident ( $user, $loginData );

			if ( $ok )
			{
				$GLOBALS['TSFE']->fe_user -> createUserSession ( $user );
				$GLOBALS['TSFE']->fe_user->user = $GLOBALS['TSFE']->fe_user->fetchUserSession();
				// enforce session so we get a FE cookie, otherwise autologin does not work (TYPO3 6.2.5+)
				$GLOBALS['TSFE']->fe_user->setAndSaveSessionData('fe_user', $user['uid']);

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
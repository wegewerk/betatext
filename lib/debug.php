<?php
class Debug {
  static function inspect( $x ) {
    $msg=$x;
    if( is_array( $x ) ) {
      $msg="Array(".count($x).")";
    }
    if( is_object($x)) {
      $msg="Object of Class ".get_class($x);
      $msg.="\nMethods:\n";
      foreach( get_class_methods($x) as $m)
        $msg.="  $m\n";
    }
    if( is_bool( $x )) {
      $msg="Bool:".$x?'T':'F';
    }
    return $msg;
  }
  static function bt($s) {
        $bt=debug_backtrace();

	$msg = array();
	foreach( $bt as $l => $i ) {
	    $msg[]=array($i['file'],
	                 $i['line'],
			 $i['class'].'::'.$i['function']
			 );
	}
  	Debug::log($msg);
  }

  /**
   * hiermit kann ein Logeintrag geschrieben werden
   *
   * @param Mixed $var was immer geloggt werden soll (String, Array, ...)
   * @param Array $options Optionen, folgende Optionen werden verstanden:
   *
   *   include_backtrace:   Boolean  soll ein Backtrace vor den Eintrag geschrieben werden? (default: false)
   *   prefix:              String   Präfix, der vor den Logeintrag geschrieben wird        (default: '')
   *   filename:            String   Dateiname der Log-Datei                                (default: 'debug.log')
   *   var_export:          Boolean  alle Nicht-Strings mittels var_export() loggen?        (default: false)
   *   var_dump:            Boolean  alle Nicht-Strings mittels var_dump() loggen?          (default: false)
   */
  static function log ( $var, $options = false )
  {
    // erstmal ein paar Defaults
    if ( !is_array ( $options ) )
    {
        $options = array ( 'include_backtrace' => $options,
                           'filename'          => 'debug.log' );
    }
    else
    {
        if ( empty ( $options [ 'filename' ] ) ) $options [ 'filename' ] = 'debug.log';
    }

    $bt_sep_start = "v-----------------------------------------v\n";
    $bt_sep_end   = "^-----------------------------------------^\n";

    // dann müssen wir wissen, wohin geloggt werden soll
  	$logpath = realpath ( dirname ( __FILE__ ) );

	$logfile = $logpath . '/' . $options [ 'filename' ];

	// wie verfahren, wenn da was anderes als nur ein String geloggt werden soll?
	if ( !is_string ( $var ) )
	{
	    if ( isset ( $options [ 'var_export' ] ) )
	        $msg = var_export ( $var, true );
	    elseif ( isset ( $options [ 'var_dump' ] ) )
	    {
	        ob_start();
	        var_dump ( $var );
	        $msg = ob_get_contents();
	        ob_end_clean();
	    }
	    else
		    $msg = print_r ( $var, true );
	}
	else
		$msg = Debug::inspect ( $var ) . "\n";

    // Präfixe
    if ( !empty ( $options [ 'prefix' ] ) )
	   $msg = date ( 'd.m.Y H:i:s ' ) . $options [ 'prefix' ] . ': ' . $msg;
	else
	   $msg = date ( 'd.m.Y H:i:s ' ) . $msg;

	if ( $options [ 'include_backtrace' ] )
		file_put_contents ( $logfile, $bt_sep_start, FILE_APPEND );

	file_put_contents ( $logfile, $msg, FILE_APPEND );

	if ( $options [ 'include_backtrace' ] )
	{
		$msg = array();
		$btr = debug_backtrace();

		foreach ( $btr as $line )
		    $msg[] = $line [ 'class' ].'::'.$line [ 'function' ].' ('.$line [ 'file' ].':'.$line [ 'line' ].')';

        file_put_contents ( $logfile, implode ( "\n  > ", $msg ) ."\n", FILE_APPEND );
		file_put_contents ( $logfile, $bt_sep_end, FILE_APPEND );
	}
  }
}



/**
 *
 * Repräsentiert eine einfache Stoppuhr
 * Beispiel:
 * $timer = new stoppUhr();
 *
 * $timer->start();
 *   ... mach was ...
 * $timer->stop();
 *
 * ... mach was anderes...
 *
 * $timer->start();
 *   ... mach wieder was ...
 * $timer->stop();
 *
 * echo  $timer->getValue();
 */
class stoppUhr {
	var $starttime;
	var $stoptime;
	var $value;
	var $running;

	function stoppUhr() {
		$this->value = 0;
	}
	/**
	 * gibt den aktuellen Wert des laufenden Timers zurück.
	 */
	function getValue( $as_milliseconds = false ) {
		if (!$this->running)
			$rawvalue = $this->value;
		else {
			$t = explode(" ", microtime());
			$rawvalue = $t[0] + $t[1] - $this->starttime;
		}
		if (!$as_milliseconds)
			return $rawvalue;
		else
			return (round($rawvalue*1000,0)).' ms';
	}
	/**
	 * setzt die Startzeit auf aktuelle Uhrzeit
	 */
	function start() {
		$t = explode(" ", microtime());
		$this->starttime = $t[0] + $t[1];
		$this->running = true;
	}

	/**
	 * stoppt den Timer und gibt den aktuellen wert zurück
	 */
	function stop() {
		$this->value += $this->getValue();
		$this->running = false;
		return $this->value;
	}

	/**
	 * stoppt den Timer und setzt den Wert auf 0
	 */
	function reset() {
		$this->stop();
		$this->value = 0;
	}
}

class stoppUhrArray {
	var $timers;
	var $calls;

	function start( $timername="" ) {
		if( $timername == "" ) {
			$btr=debug_backtrace();
			$line=$btr[1];
			$timername=$line['class'].'::'.$line['function'];
		}
		if( empty( $this -> timers[ $timername ] ) ) {
			$this -> timers[ $timername ] = new stoppUhr();
			$this -> calls[ $timername ] = array( 'starts' => 0,
												  'stops'  => 0 );
		}

		$this -> timers[ $timername ] -> start();
		$this -> calls[ $timername ][ 'starts' ]++;
	}
	function stop( $timername="" ) {
		if( $timername == "" ) {
			$btr=debug_backtrace();
			$line=$btr[2];
			$timername=$line['class'].'::'.$line['function'];
		}
		if( !empty( $this -> timers[ $timername ] ) ) {
			$this -> timers[ $timername ] -> stop();
			$this -> calls[ $timername ][ 'stops' ]++;
		}
	}
	function getValues() {
		$ret = array();
		foreach( $this -> timers as $key => $timer )
			$ret[ $key ] = $timer -> getValue( true );
		return $ret;
	}

	function getStats() {
		return $this -> calls;
	}
}

?>
<?php
define ( 'BBT_restpath', dirname ( __FILE__ ) );

$GLOBALS [ 'user' ] = tslib_eidtools::initFeUser();
tslib_eidtools::connectDB();

require 'Slim/Slim/Slim.php';
require 'debug.php';

error_reporting(0);

$env_mock = array();

$specialHeaders = array (
    'REQUEST_METHOD',
    'REMOTE_ADDR',
    'CONTENT_TYPE',
    'CONTENT_LENGTH',
    'PHP_AUTH_USER',
    'PHP_AUTH_PW',
    'PHP_AUTH_DIGEST',
    'AUTH_TYPE',
    'SCRIPT_NAME',
    'QUERY_STRING',
    'SERVER_NAME',
    'SEVER_PORT'
);

foreach ( $_SERVER as $key => $value )
{
    $value = is_string ( $value ) ? trim ( $value ) : $value;

    if ( strpos ( $key, 'HTTP_' ) === 0 )
        $env_mock [ substr ( $key, 5 ) ] = $value;
    else if ( strpos ( $key, 'X_' ) === 0 || in_array ( $key, $specialHeaders ) )
        $env_mock [ $key ] = $value;
}

$env_mock [ 'PATH_INFO' ] = $_REQUEST [ 'route' ];
$env_mock [ 'slim.url_scheme' ] = empty ( $_SERVER [ 'HTTPS' ] ) || $_SERVER [ 'HTTPS' ] === 'off' ? 'http' : 'https';

$rawInput = @file_get_contents('php://input');
if ( !$rawInput )
    $rawInput = '';

$env_mock [ 'slim.input'  ] = $rawInput;
$env_mock [ 'slim.errors' ] = fopen ( 'php://stderr', 'w' );

Slim_Environment::mock ( $env_mock );

$ww_bbt = new Slim();


// die Funktionen für die einzelnen Abfragetypen liegen in eigenen Dateien

$method = strtolower ( $ww_bbt -> request() -> getMethod() );

require BBT_restpath . '/actions/' . $method . '.php';


// Standard-Funktionen

function send_response ( $out )
{
    global $ww_bbt;

    if ( $out !== false )
    {
        $response = $ww_bbt -> response();

        $response [ 'Content-Type' ] = 'application/json';
        $response [ 'Cache-Control' ] = 'no-cache';

        echo json_encode ( $out );

    }
    else
    {

    }
}

$ww_bbt -> run();

?>
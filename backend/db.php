<?php
require_once __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;

// Only load .env if it exists (local development).
// On Railway, environment variables are injected directly — no .env file needed.
if (file_exists(__DIR__ . '/.env')) {
    $dotenv = Dotenv::createImmutable(__DIR__);
    $dotenv->load();
}

$host = $_ENV['DB_HOST'] ?? getenv('DB_HOST');
$dbname = $_ENV['DB_NAME'] ?? getenv('DB_NAME');
$username = $_ENV['DB_USER'] ?? getenv('DB_USER');
$password = $_ENV['DB_PASS'] ?? getenv('DB_PASS');
$socket = '/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock';

// Only use the local socket path if it actually exists (local XAMPP dev).
// On Railway, MySQL is a remote service — connect via host/port instead.
if (file_exists($socket)) {
    $conn = new mysqli($host, $username, $password, $dbname, null, $socket);
} else {
    $conn = new mysqli($host, $username, $password, $dbname);
}

if ($conn->connect_error) {
    die(json_encode(["error" => "Database connection failed: " . $conn->connect_error]));
}
?>
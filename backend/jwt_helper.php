<?php
require_once __DIR__ . '/vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Dotenv\Dotenv;

if (file_exists(__DIR__ . '/.env')) {
    $dotenv = Dotenv::createImmutable(__DIR__);
    $dotenv->load();
}

define('JWT_SECRET', $_ENV['JWT_SECRET'] ?? getenv('JWT_SECRET'));

function generateToken($userId, $email, $role) {
    $payload = [
        "sub" => $userId,
        "email" => $email,
        "role" => $role,
        "iat" => time(),
        "exp" => time() + (60 * 60 * 24 * 7)
    ];

    return JWT::encode($payload, JWT_SECRET, 'HS256');
}

function verifyToken($token) {
    try {
        $decoded = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
        return $decoded;
    } catch (Exception $e) {
        return null;
    }
}
?>
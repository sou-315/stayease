<?php
require_once "jwt_helper.php";

function getAuthenticatedUser() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
        return null;
    }

    $token = substr($authHeader, 7);
    $decoded = verifyToken($token);

    if (!$decoded) {
        return null;
    }

    return [
        "id" => $decoded->sub,
        "email" => $decoded->email,
        "role" => $decoded->role,
    ];
}

function requireAuth() {
    $user = getAuthenticatedUser();

    if (!$user) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized. Please log in."]);
        exit;
    }

    return $user;
}

function requireAdmin() {
    $user = requireAuth();

    if ($user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(["error" => "Admin access required."]);
        exit;
    }

    return $user;
}
?>
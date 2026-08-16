<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://stayease-swart.vercel.app");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require "db.php";

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$token = trim($data['token'] ?? '');
$newPassword = $data['password'] ?? '';

if (!$token || !$newPassword) {
    http_response_code(400);
    echo json_encode(["error" => "Token and new password are required."]);
    exit;
}

if (strlen($newPassword) < 6) {
    http_response_code(400);
    echo json_encode(["error" => "Password must be at least 6 characters."]);
    exit;
}

$stmt = $conn->prepare("SELECT id, reset_token_expiry FROM users WHERE reset_token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid or expired reset link."]);
    $stmt->close();
    $conn->close();
    exit;
}

$user = $result->fetch_assoc();
$stmt->close();

// Check if the token has expired
if (strtotime($user['reset_token_expiry']) < time()) {
    http_response_code(400);
    echo json_encode(["error" => "This reset link has expired. Please request a new one."]);
    $conn->close();
    exit;
}

// Update the password, invalidate the token so it can't be reused
$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

$updateStmt = $conn->prepare("UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?");
$updateStmt->bind_param("si", $hashedPassword, $user['id']);
$updateStmt->execute();
$updateStmt->close();

echo json_encode(["success" => true, "message" => "Your password has been reset. You can now log in."]);

$conn->close();
?>
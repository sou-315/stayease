<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require "db.php";
require "jwt_helper.php";

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

$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(["error" => "Email and password are required."]);
    exit;
}

$stmt = $conn->prepare("SELECT id, name, email, password, role FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid email or password."]);
    $stmt->close();
    $conn->close();
    exit;
}

$user = $result->fetch_assoc();

if (!password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid email or password."]);
    $stmt->close();
    $conn->close();
    exit;
}

$token = generateToken($user['id'], $user['email'], $user['role']);

echo json_encode([
    "success" => true,
    "token" => $token,
    "user" => [
        "id" => (int) $user['id'],
        "name" => $user['name'],
        "email" => $user['email'],
        "role" => $user['role']
    ]
]);

$stmt->close();
$conn->close();
?>
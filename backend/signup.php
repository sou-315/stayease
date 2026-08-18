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

$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

// Basic validation
if (!$name || !$email || !$password) {
    http_response_code(400);
    echo json_encode(["error" => "Name, email, and password are all required."]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid email address."]);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(["error" => "Password must be at least 6 characters."]);
    exit;
}

// Check if email already exists
$checkStmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$checkStmt->bind_param("s", $email);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows > 0) {
    http_response_code(409);
    echo json_encode(["error" => "An account with this email already exists."]);
    $checkStmt->close();
    $conn->close();
    exit;
}
$checkStmt->close();

// Hash the password — never store plain text
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $name, $email, $hashedPassword);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "user" => [
            "id" => $stmt->insert_id,
            "name" => $name,
            "email" => $email
        ]
    ]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to create account."]);
}

$stmt->close();
$conn->close();
?>
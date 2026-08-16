<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://stayease-swart.vercel.app");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require "db.php";
require __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

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

if (!$email) {
    http_response_code(400);
    echo json_encode(["error" => "Email is required."]);
    exit;
}

// Always respond the same way, whether or not the email exists —
// this prevents attackers from using this endpoint to discover valid accounts
$genericResponse = ["success" => true, "message" => "If an account with that email exists, a reset link has been sent."];

$stmt = $conn->prepare("SELECT id, name FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    // Don't reveal that the email doesn't exist — respond normally anyway
    echo json_encode($genericResponse);
    $stmt->close();
    $conn->close();
    exit;
}

$user = $result->fetch_assoc();
$stmt->close();

// Generate a secure random token
$token = bin2hex(random_bytes(32));
$expiry = date('Y-m-d H:i:s', strtotime('+1 hour'));

$updateStmt = $conn->prepare("UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?");
$updateStmt->bind_param("ssi", $token, $expiry, $user['id']);
$updateStmt->execute();
$updateStmt->close();

$resetLink = "https://stayease-swart.vercel.app/reset-password?token=" . $token;

// Send the email via Mailtrap
$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = $_ENV['MAILTRAP_HOST'];
    $mail->SMTPAuth = true;
    $mail->Username = $_ENV['MAILTRAP_USERNAME'];
    $mail->Password = $_ENV['MAILTRAP_PASSWORD'];
    $mail->SMTPSecure = 'tls';
    $mail->Port = $_ENV['MAILTRAP_PORT'];

    $mail->setFrom('noreply@stayease.com', 'StayEase');
    $mail->addAddress($email, $user['name']);

    $mail->isHTML(true);
    $mail->Subject = 'Reset your StayEase password';
    $mail->Body = "Hi {$user['name']},<br><br>
        You requested to reset your password. Click the link below to set a new one:<br><br>
        <a href=\"$resetLink\">$resetLink</a><br><br>
        This link expires in 1 hour. If you didn't request this, you can ignore this email.";

    $mail->send();
} catch (Exception $e) {
    // Log the error but still return the generic response — don't leak email-sending failures to the client
    error_log("Mailer error: " . $mail->ErrorInfo);
}

echo json_encode($genericResponse);
$conn->close();
?>
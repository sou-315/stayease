<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://stayease-swart.vercel.app");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require "db.php";
require "auth_middleware.php";
require __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

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

$currentUser = requireAuth();

$data = json_decode(file_get_contents("php://input"), true);
$bookingId = (int) ($data['bookingId'] ?? 0);

if (!$bookingId) {
    http_response_code(400);
    echo json_encode(["error" => "bookingId is required."]);
    exit;
}

$stmt = $conn->prepare("SELECT id, total, user_id, payment_status FROM bookings WHERE id = ?");
$stmt->bind_param("i", $bookingId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(["error" => "Booking not found."]);
    $stmt->close();
    $conn->close();
    exit;
}

$booking = $result->fetch_assoc();
$stmt->close();

if ((int) $booking['user_id'] !== (int) $currentUser['id']) {
    http_response_code(403);
    echo json_encode(["error" => "This booking doesn't belong to you."]);
    $conn->close();
    exit;
}

if ($booking['payment_status'] === 'paid') {
    http_response_code(409);
    echo json_encode(["error" => "This booking is already paid."]);
    $conn->close();
    exit;
}

// Convert booking total (stored in USD) to DZD for Chargily
$usdToDzd = 260; // approximate exchange rate — adjust as needed
$amountInDzd = (int) round($booking['total'] * $usdToDzd);

// Build the Chargily checkout request payload
$payload = [
    "amount" => $amountInDzd,
    "currency" => "dzd",
  "success_url" => "https://stayease-swart.vercel.app/booking-success?bookingId=" . $bookingId,
"failure_url" => "https://stayease-swart.vercel.app/booking-cancelled?bookingId=" . $bookingId,
   "webhook_endpoint" => "https://dawn-viscous-kosher.ngrok-free.dev/stayease-api/chargily_webhook.php",
    "metadata" => ["booking_id" => $bookingId],
];

$ch = curl_init("https://pay.chargily.net/test/api/v2/checkouts");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
"Authorization: Bearer " . getenv('CHARGILY_SECRET_KEY'),
    "Content-Type: application/json",
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$checkoutData = json_decode($response, true);

if ($httpCode !== 200 && $httpCode !== 201) {
    http_response_code(500);
    echo json_encode(["error" => "Chargily error: " . ($checkoutData['message'] ?? $response)]);
    $conn->close();
    exit;
}

// Save the checkout id so the webhook can match it back to this booking
$updateStmt = $conn->prepare("UPDATE bookings SET checkout_id = ? WHERE id = ?");
$updateStmt->bind_param("si", $checkoutData['id'], $bookingId);
$updateStmt->execute();
$updateStmt->close();

echo json_encode([
    "success" => true,
    "checkout_url" => $checkoutData['checkout_url'],
]);

$conn->close();
?>
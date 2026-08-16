<?php
require "db.php";
require __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$rawPayload = file_get_contents("php://input");
$signature = $_SERVER['HTTP_SIGNATURE'] ?? '';

if (!$signature) {
    http_response_code(400);
    echo json_encode(["error" => "Missing signature header."]);
    exit;
}

// Verify the signature matches — proves this request really came from Chargily
$expectedSignature = hash_hmac('sha256', $rawPayload, $_ENV['CHARGILY_SECRET_KEY']);

if (!hash_equals($expectedSignature, $signature)) {
    http_response_code(403);
    echo json_encode(["error" => "Invalid signature."]);
    exit;
}

$event = json_decode($rawPayload, true);

if (!$event || !isset($event['type'])) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid payload."]);
    exit;
}

if ($event['type'] === 'checkout.paid') {
    $checkoutId = $event['data']['id'] ?? null;

    if ($checkoutId) {
        $stmt = $conn->prepare("UPDATE bookings SET payment_status = 'paid' WHERE checkout_id = ?");
        $stmt->bind_param("s", $checkoutId);
        $stmt->execute();
        $stmt->close();
    }
}

// Chargily just needs a 200 response to know we received it
http_response_code(200);
echo json_encode(["received" => true]);

$conn->close();
?>
<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require "db.php";
require "auth_middleware.php";
require "booking_logic.php";

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$currentUser = requireAuth();

if ($method === 'GET') {
    $viewAll = isset($_GET['all']) && $_GET['all'] === 'true' && $currentUser['role'] === 'admin';

    if ($viewAll) {
        $sql = "
            SELECT bookings.*, hotels.name AS hotel_name, hotels.location, rooms.name AS room_name, users.name AS user_name, users.email AS user_email
            FROM bookings
            JOIN hotels ON bookings.hotel_id = hotels.id
            JOIN rooms ON bookings.room_id = rooms.id
            JOIN users ON bookings.user_id = users.id
            ORDER BY bookings.created_at DESC
        ";
        $result = $conn->query($sql);
    } else {
        $stmt = $conn->prepare("
            SELECT bookings.*, hotels.name AS hotel_name, hotels.location, rooms.name AS room_name
            FROM bookings
            JOIN hotels ON bookings.hotel_id = hotels.id
            JOIN rooms ON bookings.room_id = rooms.id
            WHERE bookings.user_id = ?
            ORDER BY bookings.created_at DESC
        ");
        $stmt->bind_param("i", $currentUser['id']);
        $stmt->execute();
        $result = $stmt->get_result();
    }

    $bookings = [];
    while ($row = $result->fetch_assoc()) {
        $row["id"] = (int) $row["id"];
        $row["hotel_id"] = (int) $row["hotel_id"];
        $row["room_id"] = (int) $row["room_id"];
        $row["guests"] = (int) $row["guests"];
        $row["total"] = (int) $row["total"];
        $bookings[] = $row;
    }

    echo json_encode($bookings);
    if (isset($stmt)) $stmt->close();
    $conn->close();
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $hotelId = (int) $data['hotelId'];
    $roomId = (int) $data['roomId'];
    $checkIn = $data['checkIn'];
    $checkOut = $data['checkOut'];
    $guests = (int) $data['guests'];
    $total = (int) $data['total'];
    $userId = (int) $currentUser['id'];

    if (hasOverlap($conn, $roomId, $checkIn, $checkOut)) {
        http_response_code(409);
        echo json_encode(["error" => "This room is already booked for those dates."]);
        $conn->close();
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO bookings (hotel_id, room_id, user_id, check_in, check_out, guests, total) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("iiissii", $hotelId, $roomId, $userId, $checkIn, $checkOut, $guests, $total);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "id" => $stmt->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to create booking"]);
    }

    $stmt->close();
    $conn->close();
    exit;
}

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Booking id is required"]);
        $conn->close();
        exit;
    }

    $checkStmt = $conn->prepare("SELECT user_id FROM bookings WHERE id = ?");
    $checkStmt->bind_param("i", $id);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();

    if ($checkResult->num_rows === 0) {
        http_response_code(404);
        echo json_encode(["error" => "Booking not found"]);
        $checkStmt->close();
        $conn->close();
        exit;
    }

    $booking = $checkResult->fetch_assoc();
    $checkStmt->close();

    if ((int) $booking['user_id'] !== (int) $currentUser['id']) {
        http_response_code(403);
        echo json_encode(["error" => "You can only cancel your own bookings."]);
        $conn->close();
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM bookings WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to delete booking"]);
    }

    $stmt->close();
    $conn->close();
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
$conn->close();
?>
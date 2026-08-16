<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://stayease-swart.vercel.app");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require "db.php";
require "auth_middleware.php";

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ---------- GET (public — rooms for a specific hotel) ----------
if ($method === 'GET') {
    $hotelId = isset($_GET['hotel_id']) ? (int) $_GET['hotel_id'] : 0;

    if (!$hotelId) {
        http_response_code(400);
        echo json_encode(["error" => "hotel_id is required."]);
        $conn->close();
        exit;
    }

    $stmt = $conn->prepare("SELECT id, hotel_id, room_type, name, price FROM rooms WHERE hotel_id = ?");
    $stmt->bind_param("i", $hotelId);
    $stmt->execute();
    $result = $stmt->get_result();

    $rooms = [];
    while ($row = $result->fetch_assoc()) {
        $row["id"] = (int) $row["id"];
        $row["hotel_id"] = (int) $row["hotel_id"];
        $row["price"] = (int) $row["price"];
        $rooms[] = $row;
    }

    echo json_encode($rooms);
    $stmt->close();
    $conn->close();
    exit;
}

// ---------- POST (create — admin only) ----------
if ($method === 'POST') {
    requireAdmin();

    $data = json_decode(file_get_contents("php://input"), true);

    $hotelId = (int) ($data['hotel_id'] ?? 0);
    $roomType = trim($data['room_type'] ?? '');
    $name = trim($data['name'] ?? '');
    $price = (int) ($data['price'] ?? 0);

    if (!$hotelId || !$roomType || !$name || !$price) {
        http_response_code(400);
        echo json_encode(["error" => "hotel_id, room_type, name, and price are all required."]);
        $conn->close();
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO rooms (hotel_id, room_type, name, price) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("issi", $hotelId, $roomType, $name, $price);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "id" => $stmt->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to create room."]);
    }

    $stmt->close();
    $conn->close();
    exit;
}

// ---------- PUT (update — admin only) ----------
if ($method === 'PUT') {
    requireAdmin();

    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Room id is required."]);
        $conn->close();
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);

    $roomType = trim($data['room_type'] ?? '');
    $name = trim($data['name'] ?? '');
    $price = (int) ($data['price'] ?? 0);

    $stmt = $conn->prepare("UPDATE rooms SET room_type = ?, name = ?, price = ? WHERE id = ?");
    $stmt->bind_param("ssii", $roomType, $name, $price, $id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to update room."]);
    }

    $stmt->close();
    $conn->close();
    exit;
}

// ---------- DELETE (admin only) ----------
if ($method === 'DELETE') {
    requireAdmin();

    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Room id is required."]);
        $conn->close();
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM rooms WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        // Likely a foreign key conflict — a booking still references this room
        http_response_code(409);
        echo json_encode(["error" => "Cannot delete this room — it has existing bookings."]);
    }

    $stmt->close();
    $conn->close();
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
$conn->close();
?>
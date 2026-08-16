<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require "db.php";
require "auth_middleware.php";

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function getRoomsForHotel(mysqli $conn, int $hotelId) {
    $stmt = $conn->prepare("SELECT id, room_type, name, price FROM rooms WHERE hotel_id = ?");
    $stmt->bind_param("i", $hotelId);
    $stmt->execute();
    $result = $stmt->get_result();

    $rooms = [];
    while ($room = $result->fetch_assoc()) {
        $room["id"] = (int) $room["id"];
        $room["price"] = (int) $room["price"];
        $rooms[] = $room;
    }

    $stmt->close();
    return $rooms;
}

// ---------- GET (public — anyone can browse hotels) ----------
if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $id = (int) $_GET['id'];
        $stmt = $conn->prepare("SELECT * FROM hotels WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            $row["id"] = (int) $row["id"];
            $row["price"] = (int) $row["price"];
            $row["rating"] = (float) $row["rating"];
            $row["amenities"] = json_decode($row["amenities"]);
            $row["rooms"] = getRoomsForHotel($conn, $row["id"]);
            echo json_encode($row);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Hotel not found"]);
        }

        $stmt->close();
        $conn->close();
        exit;
    }

    $result = $conn->query("SELECT * FROM hotels");
    $hotels = [];

    while ($row = $result->fetch_assoc()) {
        $row["id"] = (int) $row["id"];
        $row["price"] = (int) $row["price"];
        $row["rating"] = (float) $row["rating"];
        $row["amenities"] = json_decode($row["amenities"]);
        $row["rooms"] = getRoomsForHotel($conn, $row["id"]);
        $hotels[] = $row;
    }

    echo json_encode($hotels);
    $conn->close();
    exit;
}

// ---------- POST (create — admin only) ----------
if ($method === 'POST') {
    requireAdmin();

    $data = json_decode(file_get_contents("php://input"), true);

    $name = trim($data['name'] ?? '');
    $location = trim($data['location'] ?? '');
    $price = (int) ($data['price'] ?? 0);
    $rating = (float) ($data['rating'] ?? 0);
    $image = trim($data['image'] ?? '');
    $description = trim($data['description'] ?? '');
    $amenities = json_encode($data['amenities'] ?? []);

    if (!$name || !$location || !$price) {
        http_response_code(400);
        echo json_encode(["error" => "Name, location, and price are required."]);
        $conn->close();
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO hotels (name, location, price, rating, image, description, amenities) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssidsss", $name, $location, $price, $rating, $image, $description, $amenities);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "id" => $stmt->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to create hotel."]);
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
        echo json_encode(["error" => "Hotel id is required."]);
        $conn->close();
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);

    $name = trim($data['name'] ?? '');
    $location = trim($data['location'] ?? '');
    $price = (int) ($data['price'] ?? 0);
    $rating = (float) ($data['rating'] ?? 0);
    $image = trim($data['image'] ?? '');
    $description = trim($data['description'] ?? '');
    $amenities = json_encode($data['amenities'] ?? []);

    $stmt = $conn->prepare("UPDATE hotels SET name = ?, location = ?, price = ?, rating = ?, image = ?, description = ?, amenities = ? WHERE id = ?");
    $stmt->bind_param("ssidsssi", $name, $location, $price, $rating, $image, $description, $amenities, $id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to update hotel."]);
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
        echo json_encode(["error" => "Hotel id is required."]);
        $conn->close();
        exit;
    }

    // Rooms reference this hotel via foreign key — delete them first
    $deleteRooms = $conn->prepare("DELETE FROM rooms WHERE hotel_id = ?");
    $deleteRooms->bind_param("i", $id);
    $deleteRooms->execute();
    $deleteRooms->close();

    $stmt = $conn->prepare("DELETE FROM hotels WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to delete hotel."]);
    }

    $stmt->close();
    $conn->close();
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
$conn->close();
?>
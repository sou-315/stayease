<?php
function hasOverlap(mysqli $conn, int $roomId, string $checkIn, string $checkOut): bool {
    $stmt = $conn->prepare("
        SELECT id FROM bookings
        WHERE room_id = ?
        AND check_in < ?
        AND check_out > ?
    ");
    $stmt->bind_param("iss", $roomId, $checkOut, $checkIn);
    $stmt->execute();
    $result = $stmt->get_result();

    $overlap = $result->num_rows > 0;
    $stmt->close();

    return $overlap;
}
?>
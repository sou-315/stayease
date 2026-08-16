<?php
use PHPUnit\Framework\TestCase;

class BookingOverlapTest extends TestCase
{
    private static $testRoomId;
    private static $testHotelId;
    private static $conn;

   public static function setUpBeforeClass(): void
{
    global $conn;

    require_once __DIR__ . '/../db.php';
    require_once __DIR__ . '/../booking_logic.php';

    self::$conn = $conn;

        // Create a temporary hotel + room just for this test
        self::$conn->query("INSERT INTO hotels (name, location, price, rating) VALUES ('Test Hotel', 'Test City', 100, 4.0)");
        self::$testHotelId = self::$conn->insert_id;

        self::$conn->query("INSERT INTO rooms (hotel_id, room_type, name, price) VALUES (" . self::$testHotelId . ", 'standard', 'Test Room', 100)");
        self::$testRoomId = self::$conn->insert_id;

        // Insert an existing booking: June 10 - June 15
        $stmt = self::$conn->prepare("INSERT INTO bookings (hotel_id, room_id, check_in, check_out, guests, total, payment_status) VALUES (?, ?, '2027-06-10', '2027-06-15', 1, 500, 'paid')");
        $stmt->bind_param("ii", self::$testHotelId, self::$testRoomId);
        $stmt->execute();
        $stmt->close();
    }

    public static function tearDownAfterClass(): void
    {
        self::$conn->query("DELETE FROM bookings WHERE hotel_id = " . self::$testHotelId);
        self::$conn->query("DELETE FROM rooms WHERE hotel_id = " . self::$testHotelId);
        self::$conn->query("DELETE FROM hotels WHERE id = " . self::$testHotelId);
    }

    public function testDetectsExactOverlap()
    {
        $result = hasOverlap(self::$conn, self::$testRoomId, '2027-06-10', '2027-06-15');
        $this->assertTrue($result, "Exact same dates should be detected as overlapping.");
    }

    public function testDetectsPartialOverlapAtStart()
    {
        $result = hasOverlap(self::$conn, self::$testRoomId, '2027-06-08', '2027-06-12');
        $this->assertTrue($result, "Overlapping at the start should be detected.");
    }

    public function testDetectsPartialOverlapAtEnd()
    {
        $result = hasOverlap(self::$conn, self::$testRoomId, '2027-06-13', '2027-06-18');
        $this->assertTrue($result, "Overlapping at the end should be detected.");
    }

    public function testDetectsBookingFullyInsideExisting()
    {
        $result = hasOverlap(self::$conn, self::$testRoomId, '2027-06-11', '2027-06-13');
        $this->assertTrue($result, "A booking fully inside an existing one should be detected.");
    }

    public function testAllowsBookingBeforeExisting()
    {
        $result = hasOverlap(self::$conn, self::$testRoomId, '2027-06-01', '2027-06-05');
        $this->assertFalse($result, "A booking entirely before the existing one should be allowed.");
    }

    public function testAllowsBookingAfterExisting()
    {
        $result = hasOverlap(self::$conn, self::$testRoomId, '2027-06-20', '2027-06-25');
        $this->assertFalse($result, "A booking entirely after the existing one should be allowed.");
    }

    public function testAllowsBackToBackCheckout()
    {
        $result = hasOverlap(self::$conn, self::$testRoomId, '2027-06-15', '2027-06-20');
        $this->assertFalse($result, "A booking starting exactly on the existing checkout date should be allowed.");
    }
}
?>
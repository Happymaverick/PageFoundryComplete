<?php
require_once __DIR__ . '/../cors.php'; // MUSS GANZ OBEN STEHEN!

header('Content-Type: application/json');
require_once '../config/db.php';
require_once '../classes/Database.php';
require_once '../classes/User.php';

$db = new Database($pdo);
$user = new User($db);

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $user->register($data);
    echo json_encode(["success" => true, "message" => "Account created successfully."]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["error" => $e->getMessage()]);
}
?>

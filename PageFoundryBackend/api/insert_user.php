<?php
require_once '../cors.php';

header('Content-Type: application/json');
require_once '../config/db.php';
require_once '../classes/Database.php';
require_once '../classes/User.php';

$db = new Database($pdo);
$user = new User($db);

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $user->insert($data);
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["error" => $e->getMessage()]);
}
?>

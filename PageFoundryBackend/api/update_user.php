<?php
require_once '../cors.php';

header('Content-Type: application/json');
require_once '../config/db.php';
require_once '../classes/Database.php';
require_once '../classes/User.php';

$db = new Database($pdo);
$user = new User($db);

try {
    $id = $_GET['id'] ?? null;
    $data = json_decode(file_get_contents('php://input'), true);
    $user->update($id, $data);
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["error" => $e->getMessage()]);
}
?>

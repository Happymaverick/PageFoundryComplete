<?php
require_once '../cors.php';

header('Content-Type: application/json');
require_once '../config/db.php';
require_once '../classes/Database.php';
require_once '../classes/User.php';

$db = new Database($pdo);
$user = new User($db);

echo json_encode($user->getAll());
?>

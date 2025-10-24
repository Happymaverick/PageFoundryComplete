<?php
header('Content-Type: application/json');

// === DB-Verbindung ===
$DB_HOST = 'localhost';
$DB_NAME = 'pagefoundry_db';
$DB_USER = 'root';
$DB_PASS = 'pf_db_2025!';

try {
    $pdo = new PDO(
        "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "DB connection failed"]);
    exit;
}

// === Token / Rolle prüfen ===
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = null;
if (preg_match('/Bearer\s+(.+)/', $authHeader, $m)) {
    $token = trim($m[1]);
}

// Platzhalter, bis Sessions sauber sind
$user_role = 'admin';

// Nur Admin oder Employee dürfen Status ändern
if (!in_array($user_role, ['admin','employee'], true)) {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "forbidden"]);
    exit;
}

// === Body lesen ===
$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody, true);

$order_id   = isset($data['order_id']) ? (int)$data['order_id'] : 0;
$new_status = isset($data['status'])   ? $data['status']         : null;

// === Status validieren ===
$allowed = [
  'eingegangen',
  'in_bearbeitung',
  'wartet_auf_kunde',
  'review_intern',
  'fertig',
  'abgeschlossen'
];

if (!$order_id || !$new_status || !in_array($new_status, $allowed, true)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "invalid input"]);
    exit;
}

// === Update fahren ===
try {
    $stmt = $pdo->prepare("
        UPDATE project_orders
        SET status = :st,
            last_status_update = NOW()
        WHERE id = :id
        LIMIT 1
    ");
    $stmt->execute([
        ':st' => $new_status,
        ':id' => $order_id
    ]);

    echo json_encode(["success" => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "db error"]);
}

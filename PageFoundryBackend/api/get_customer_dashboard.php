<?php
header('Content-Type: application/json');

// Debug-Fehler während der Entwicklung anzeigen
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// DB-Verbindung
require_once '../config/db.php';  // Erforderlich: Diese Datei stellt $pdo oder null bereit

// Wenn die Verbindung zur DB nicht zustande kommt, gib Fehler zurück
if ($pdo === null) {
    http_response_code(500);
    echo json_encode(["error" => "DB connection failed"]);
    exit;
}

// === Token lesen ===
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = null;
if (preg_match('/Bearer\s+(.+)/', $authHeader, $m)) {
    $token = trim($m[1]);
}

// Token -> User-ID holen
// Hier kann später JWT oder eine Session basierte Lösung implementiert werden.
// Jetzt nehmen wir als Platzhalter einen statischen Wert für die Demo.
$user_id = 2; // MOCK: Benutzer-ID, dies sollte aus dem Token gelesen werden.

// === Wenn kein User (oder Token ungültig) ===
if (!$user_id) {
    echo json_encode([
        "nextConsulting" => null,
        "projects" => []
    ]);
    exit;
}

// === Nächster Consulting-Termin ===
$nextConsulting = null;
try {
    $stmt = $pdo->prepare("
        SELECT timestamp_start, zoom_url, goal
        FROM consulting_appointments
        WHERE user_id = :uid
          AND timestamp_start >= NOW()
        ORDER BY timestamp_start ASC
        LIMIT 1
    ");
    $stmt->execute([':uid' => $user_id]);
    $row = $stmt->fetch();
    if ($row) {
        $nextConsulting = [
            "timestamp_start" => $row['timestamp_start'],
            "zoom_url"        => $row['zoom_url'],
            "goal"            => $row['goal']
        ];
    }
} catch (Exception $e) {
    // Fehler beim Abrufen des nächsten Consulting-Termins
    $nextConsulting = null;
}

// === Projekte / Paid Orders ===
$projects = [];
try {
    $stmt = $pdo->prepare("
        SELECT id, package_id, status, last_status_update, deadline_note
        FROM project_orders
        WHERE user_id = :uid
        ORDER BY created_at DESC
    ");
    $stmt->execute([':uid' => $user_id]);
    while ($r = $stmt->fetch()) {
        $projects[] = [
            "id"                 => (int)$r['id'],
            "package_id"         => $r['package_id'],
            "status"             => $r['status'],
            "last_status_update" => $r['last_status_update'],
            "deadline_note"      => $r['deadline_note']
        ];
    }
} catch (Exception $e) {
    // Fehler beim Abrufen der Projekte
    $projects = [];
}

echo json_encode([
    "nextConsulting" => $nextConsulting,
    "projects" => $projects
]);

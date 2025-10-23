<?php
// cors.php

// Erlaubte Ursprünge (nur Angular Dev + später evtl. Live-Seite)
$allowedOrigins = [
    'http://localhost:4200',
    'http://127.0.0.1:4200'
];

// Aktuelle Origin auslesen
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Prüfen, ob erlaubt
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// OPTIONS-Preflight direkt beenden
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

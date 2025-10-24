<?php
header('Content-Type: application/json');

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// zentrale DB-Verbindung laden
require_once '../config/db.php';

// Falls DB kaputt
if ($pdo === null) {
    http_response_code(500);
    echo json_encode([
        "consultingLeads" => [],
        "paidOrders" => [],
        "error" => "DB connection failed"
    ]);
    exit;
}

// --- Auth / Rolle ---
// TODO: Token -> User -> Rolle
// Jetzt: fest admin/employee erlaubt
$user_role = 'admin';
if (!in_array($user_role, ['admin','employee'], true)) {
    echo json_encode([
        "consultingLeads" => [],
        "paidOrders" => []
    ]);
    exit;
}

// --- Consulting Leads (free consulting bookings etc) ---
$consultingLeads = [];
try {
    $stmt = $pdo->query("
        SELECT
            timestamp_start,
            full_name,
            company_name,
            email,
            phone,
            website_url,
            budget_range,
            goal,
            pain_description,
            zoom_url
        FROM consulting_appointments
        WHERE timestamp_start >= NOW()
        ORDER BY timestamp_start ASC
        LIMIT 100
    ");

    while ($row = $stmt->fetch()) {
        $consultingLeads[] = [
            "timestamp_start"  => $row['timestamp_start'],
            "full_name"        => $row['full_name'],
            "company_name"     => $row['company_name'],
            "email"            => $row['email'],
            "phone"            => $row['phone'],
            "website_url"      => $row['website_url'],
            "budget_range"     => $row['budget_range'],
            "goal"             => $row['goal'],
            "pain_description" => $row['pain_description'],
            "zoom_url"         => $row['zoom_url']
        ];
    }
} catch (Exception $e) {
    $consultingLeads = [];
}

// --- Paid Orders (Stripe Orders / Projektaufträge) ---
$paidOrders = [];
try {
    $stmt = $pdo->query("
        SELECT
            id,
            company_name,
            contact_email,
            contact_phone,
            package_id,
            amount_total_cents,
            currency,
            deadline_note,
            goal_description,
            requested_scope,
            assets_available,
            status,
            created_at,
            last_status_update
        FROM project_orders
        ORDER BY created_at DESC
        LIMIT 100
    ");

    while ($row = $stmt->fetch()) {
        $paidOrders[] = [
            "id"                 => (int)$row['id'],
            "company_name"       => $row['company_name'],
            "contact_email"      => $row['contact_email'],
            "contact_phone"      => $row['contact_phone'],
            "package_id"         => $row['package_id'],
            "amount_total_cents" => isset($row['amount_total_cents']) ? (int)$row['amount_total_cents'] : null,
            "currency"           => $row['currency'],
            "deadline_note"      => $row['deadline_note'],
            "goal_description"   => $row['goal_description'],
            "requested_scope"    => $row['requested_scope'],
            "assets_available"   => $row['assets_available'],
            "status"             => $row['status'],
            "created_at"         => $row['created_at'],
            "last_status_update" => $row['last_status_update'] ?? null
        ];
    }
} catch (Exception $e) {
    $paidOrders = [];
}

// --- Response ---
echo json_encode([
    "consultingLeads" => $consultingLeads,
    "paidOrders"      => $paidOrders
]);

<?php
header('Content-Type: application/json');

// Hartes Debug während Integration
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

/**
 * Hilfsabbruch: gibt sauberes JSON + 500 zurück und beendet.
 */
function fail($label, $extra = []) {
    http_response_code(500);
    echo json_encode([
        "error" => $label,
        "debug" => $extra
    ]);
    exit;
}

/**
 * 1. DB laden
 * Wir binden db.php über absoluten Pfad ein,
 * nicht relativ über CWD, damit nginx/alias kein Theater macht.
 */
$configPath = __DIR__ . '/../config/db.php';

if (!file_exists($configPath)) {
    fail('db_config_missing', [
        'expected_path' => $configPath,
        '__DIR__'       => __DIR__,
        'ls_api'        => scandir(__DIR__),
        'ls_parent'     => scandir(dirname(__DIR__)),
    ]);
}

require_once $configPath;

/**
 * Erwartung: db.php setzt $pdo (PDO Verbindung)
 * Falls nicht vorhanden oder kaputt -> abbrechen.
 */
if (!isset($pdo) || !$pdo) {
    fail('db_connection_not_available', [
        'config_used' => $configPath
    ]);
}

if (!($pdo instanceof PDO)) {
    fail('pdo_is_not_pdo', [
        'type'  => gettype($pdo),
        'class' => is_object($pdo) ? get_class($pdo) : null
    ]);
}

// optional: DB-Error-Mode sicherstellen
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// --- 2. Auth / Rolle ---
// TODO: Später Token -> User -> Role via sessions / jwt
// Jetzt statisch "admin"
$user_role = 'admin';
if (!in_array($user_role, ['admin', 'employee'], true)) {
    // Zugriff verweigert. Kein 500, sondern leer legit.
    echo json_encode([
        "consultingLeads" => [],
        "paidOrders"      => [],
        "note"            => "access_denied_for_role",
        "role"            => $user_role
    ]);
    exit;
}

// --- 3. Consulting Leads einsammeln ---
$consultingLeads = [];
$consultingError = null;

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

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
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
} catch (Throwable $e) {
    // Tabelle/Spaltenfehler etc.
    $consultingLeads = [];
    $consultingError = $e->getMessage();
}

// --- 4. Paid Orders einsammeln ---
$paidOrders = [];
$ordersError = null;

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

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $paidOrders[] = [
            "id"                 => (int)$row['id'],
            "company_name"       => $row['company_name'],
            "contact_email"      => $row['contact_email'],
            "contact_phone"      => $row['contact_phone'],
            "package_id"         => $row['package_id'],
            "amount_total_cents" => isset($row['amount_total_cents'])
                                      ? (int)$row['amount_total_cents']
                                      : null,
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
} catch (Throwable $e) {
    $paidOrders = [];
    $ordersError = $e->getMessage();
}

// --- 5. Normale Response (immer 200) ---
// Admin-Frontend versteht das. Wenn leer, zeigt es "Failed to load dashboard."
http_response_code(200);
echo json_encode([
    "consultingLeads" => $consultingLeads,
    "paidOrders"      => $paidOrders,
    "debug" => [
        "consultingError" => $consultingError,
        "ordersError"     => $ordersError,
        "db_config_used"  => $configPath
    ]
]);
exit;

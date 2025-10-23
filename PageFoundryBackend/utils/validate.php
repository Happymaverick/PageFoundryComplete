<?php
function validateString($str, $min = 1, $max = 255) {
    $str = trim($str);
    return strlen($str) >= $min && strlen($str) <= $max;
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function validateBool($value) {
    return in_array($value, [true, false, 0, 1, "0", "1"], true);
}

function sanitize($str) {
    return htmlspecialchars(strip_tags(trim($str)));
}
?>

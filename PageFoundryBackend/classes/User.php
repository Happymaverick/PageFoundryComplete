<?php
require_once __DIR__ . '/../utils/validate.php';

class User {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // INSERT
    public function insert($data) {
        if (
            !validateString($data['username'], 3, 50) ||
            !validateEmail($data['email']) ||
            !validateString($data['firstname'], 1, 50) ||
            !validateString($data['name'], 1, 50)
        ) {
            throw new Exception("Invalid input data.");
        }

        $sql = "INSERT INTO users (username, email, password, firstname, name, newsletter, role)
        VALUES (:username, :email, :password, :firstname, :name, :newsletter, :role)";
        $this->db->query($sql, [
            ':username' => sanitize($data['username']),
            ':email' => sanitize($data['email']),
            ':firstname' => sanitize($data['firstname']),
            ':name' => sanitize($data['name']),
            ':newsletter' => $data['newsletter'] ? 1 : 0,
            ':role' => in_array($data['role'], ['admin', 'employee', 'customer']) ? $data['role'] : 'customer'
        ]);
        return true;
    }

    // SELECT
    public function getAll() {
        return $this->db->fetchAll("SELECT * FROM users ORDER BY id DESC");
    }

    // UPDATE
    public function update($id, $data) {
        if (!is_numeric($id)) {
            throw new Exception("Invalid ID");
        }

        $sql = "UPDATE users
                SET username = :username, email = :email, role = :role, newsletter = :newsletter
                WHERE id = :id";
        $this->db->query($sql, [
            ':id' => $id,
            ':username' => sanitize($data['username']),
            ':email' => sanitize($data['email']),
            ':role' => in_array($data['role'], ['admin', 'employee', 'customer']) ? $data['role'] : 'customer',
            ':newsletter' => $data['newsletter'] ? 1 : 0
        ]);
        return true;
    }

    // DELETE
    public function delete($id) {
        if (!is_numeric($id)) {
            throw new Exception("Invalid ID");
        }

        $this->db->query("DELETE FROM users WHERE id = :id", [':id' => $id]);
        return true;
    }

    public function register($data) {
    if (
        !validateString($data['username'], 3, 50) ||
        !validateEmail($data['email']) ||
        !validateString($data['firstname'], 1, 50) ||
        !validateString($data['name'], 1, 50) ||
        !validateString($data['password'], 6, 255)
    ) {
        throw new Exception("Invalid registration data.");
    }

    // Prüfen, ob User existiert
    $existing = $this->db->fetch("SELECT id FROM users WHERE email = :email", [
        ':email' => sanitize($data['email'])
    ]);
    if ($existing) {
        throw new Exception("Email already registered.");
    }

    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

    $sql = "INSERT INTO users (username, email, password, firstname, name, newsletter, role)
        VALUES (:username, :email, :password, :firstname, :name, :newsletter, :role)";
    $this->db->query($sql, [
        ':username' => sanitize($data['username']),
        ':email' => sanitize($data['email']),
        ':firstname' => sanitize($data['firstname']),
        ':name' => sanitize($data['name']),
        ':password' => $hashedPassword,
        ':newsletter' => $data['newsletter'] ? 1 : 0,
        ':role' => in_array($data['role'], ['admin', 'employee', 'customer']) ? $data['role'] : 'customer'
    ]);

    return true;
}

public function login($email, $password) {
    if (!validateEmail($email)) {
        throw new Exception("Invalid email format.");
    }

    $user = $this->db->fetch("SELECT * FROM users WHERE email = :email", [':email' => sanitize($email)]);
    if (!$user) {
        throw new Exception("User not found.");
    }

    if (!password_verify($password, $user['password'])) {
        throw new Exception("Incorrect password.");
    }

    // Rückgabe ohne Passwort
    unset($user['password']);
    return $user;
}

}
?>

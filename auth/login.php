<?php
session_start();
header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "tryon_db";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Database connection failed."]);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = trim($_POST["username"]);
    $passwordInput = trim($_POST["password"]);

    $stmt = $conn->prepare("SELECT id, password FROM users WHERE name = ?");
    $stmt->bind_param("s", $name);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows === 1) {
        $stmt->bind_result($id, $hashedPassword);
        $stmt->fetch();

        if (password_verify($passwordInput, $hashedPassword)) {
            $_SESSION['user'] = $name;
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "invalid", "message" => "Incorrect password."]);
        }
    } else {
        echo json_encode(["status" => "invalid", "message" => "User not found."]);
    }
    $stmt->close();
}
$conn->close();
?>

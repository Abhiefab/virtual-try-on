<?php
// gallery/getImages.php

$uploadDir = __DIR__ . '/uploads/';
$images = glob($uploadDir . '*.png');

$imagePaths = [];

// Build dynamic base URL
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
$host = $_SERVER['HTTP_HOST'];

// Since `getImages.php` is inside `gallery/`, uploaded images are in `gallery/uploads/`
// But gallery.html is in the root folder, so we must point to: gallery/uploads/filename.png
$baseUrl = $protocol . $host . dirname($_SERVER['SCRIPT_NAME']) . '/uploads/';

foreach ($images as $img) {
    $imagePaths[] = $baseUrl . basename($img);
}

header('Content-Type: application/json');
echo json_encode($imagePaths);

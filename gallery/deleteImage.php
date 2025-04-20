<?php
// gallery/deleteImage.php

header('Content-Type: application/json');

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

// Read JSON input
$data = json_decode(file_get_contents('php://input'), true);

// Check if filename is provided
if (!isset($data['filename'])) {
    echo json_encode(['success' => false, 'message' => 'Filename not provided.']);
    exit;
}

// Clean the filename to prevent directory traversal
$filename = basename($data['filename']);

// Absolute path to the correct uploads folder
$filepath = __DIR__ . '/uploads/' . $filename;

// Delete file if it exists
if (file_exists($filepath)) {
    if (unlink($filepath)) {
        echo json_encode(['success' => true, 'message' => 'Image deleted successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Unable to delete the image.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'File not found.']);
}

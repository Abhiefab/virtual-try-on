<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!isset($data['image'])) {
        echo json_encode(['success' => false, 'message' => 'No image data received']);
        exit;
    }

    $img = $data['image'];
    $img = str_replace('data:image/png;base64,', '', $img);
    $img = str_replace(' ', '+', $img);
    $decodedData = base64_decode($img);

    // ✅ Save inside "gallery/uploads/"
    $uploadDir = __DIR__ . '/uploads/';
    $relativePath = 'gallery/uploads/'; // ✅ This is what the browser needs

    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $fileName = 'image_' . uniqid() . '.png';
    $filePath = $uploadDir . $fileName;

    if (file_put_contents($filePath, $decodedData)) {
        echo json_encode([
            'success' => true,
            'message' => 'Image saved successfully!',
            'file' => $relativePath . $fileName // Used for displaying image in browser
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to save the image']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>

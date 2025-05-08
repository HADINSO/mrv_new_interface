<?php

require './Class/Estaciones.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

$nombre = $_POST['nombre'] ?? '';
$descripcion = $_POST['descripcion'] ?? '';
$lat = $_POST['lat'] ?? '';
$lng = $_POST['lng'] ?? '';
$id_tipo_estacion = $_POST['id_tipo_estacion'] ?? '';
$imagen = $_FILES['imagen'] ?? null;

if (!$nombre || !$lat || !$lng || !$id_tipo_estacion || !$imagen) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos']);
    exit;
}


$uploadDir = __DIR__ . '/uploads/estaciones/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}
$imageName = uniqid() . '_' . basename($imagen['name']);
$targetFile = $uploadDir . $imageName;

if (!move_uploaded_file($imagen['tmp_name'], $targetFile)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al subir la imagen']);
    exit;
}

$success = Estaciones::crear([
    'nombre' => $nombre,
    'descripcion' => $descripcion,
    'lat' => $lat,
    'lng' => $lng,
    'id_tipo_estacion' => $id_tipo_estacion,
    'imagen' => $imageName,
]);

if ($success) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al guardar en la base de datos']);
}

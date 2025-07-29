<?php

require_once './Class/Estaciones.php';

header('Content-Type: application/json');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405); // Método no permitido
        echo json_encode([
            'success' => false,
            'message' => 'Método no permitido. Usa POST.'
        ]);
        exit;
    }

    $codigo   = $_POST['codigo'] ?? null;
    $estacion = $_POST['estacion'] ?? null;
    $cantidad = $_POST['cantidad'] ?? null;

    if (!$codigo || !$estacion || !$cantidad) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Faltan parámetros requeridos: codigo, estacion o cantidad.'
        ]);
        exit;
    }

    $resultado = Estaciones::obtenerLectura($codigo, $estacion, $cantidad);

    echo json_encode([
        'success' => true,
        'data' => $resultado
    ]);
} catch (Exception $e) {
    http_response_code(500); 
    echo json_encode([
        'success' => false,
        'message' => 'Error al procesar la solicitud.',
        'error' => $e->getMessage()
    ]);
}

<?php

require_once './Class/Sensor.php';

header('Content-Type: application/json');
$data = json_decode(file_get_contents("php://input"));

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Método no permitido.");
    }

    if (!$data || !isset($data->id)) {
        throw new Exception("Faltan datos requeridos: id.");
    }

    $id = intval($data->id);
    $responseData = Sensor::deleteSensorEstacion($id);

    echo json_encode([
        'success' => true,
        'data' => $responseData
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al procesar la solicitud.',
        'error' => $e->getMessage()
    ]);
}

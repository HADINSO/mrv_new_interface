<?php

require_once './Class/Estaciones.php';

header('Content-Type: application/json');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Método no permitido.");
    }

    $data = json_decode(file_get_contents("php://input"));

    if (!$data || !isset($data->id)) {
        throw new Exception("Faltan datos requeridos: sensorId.");
    }

    $id = intval($data->id);
    $responseData = Estaciones::deleteEstacion($id);

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

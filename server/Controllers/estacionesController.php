<?php

require './Class/Estaciones.php';

header('Content-Type: application/json');

try {
    $data = Estaciones::getEstacion();
    echo json_encode([
        'success' => true,
        'data' => $data
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener las estaciones.',
        'error' => $e->getMessage()
    ]);
}
?>

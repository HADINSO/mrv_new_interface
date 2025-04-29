<?php

require './Class/Sensor.php';

header('Content-Type: application/json');
            

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($sersor) && isset($estacion)) {
        $data = Sensor::addSensorEstacion($sersor, $estacion);
    } else {
        $data = Sensor::getSensorEstacion($_GET['id']); 
    }

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

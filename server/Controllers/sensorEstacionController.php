<?php

require './Class/Sensor.php';

header('Content-Type: application/json');
            

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['sensor']) && isset($_GET['add'])) {
        $data = Sensor::addSensorEstacion($_GET['sensor'], $_GET['add']);
    }else {
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

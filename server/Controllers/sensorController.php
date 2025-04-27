<?php

require './Class/Sensor.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"));

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($data)) {
        // Verificar si los datos necesarios están presentes
        if (!isset($data->nombre, $data->minimo, $data->maximo, $data->codigo, $data->grafico, $data->tipo_sensor, $data->rango_chart)) {
            throw new Exception("Faltan datos requeridos.");
        }

        $nombre = $data->nombre;
        $minimo = $data->minimo;
        $maximo = $data->maximo;
        $codigo = $data->codigo;
        $grafico = $data->grafico;
        $tipo_sensor = $data->tipo_sensor;
        $rango_chart = $data->rango_chart;


        $responseData = Sensor::addSensor($nombre, $minimo, $maximo, $codigo, $grafico, $tipo_sensor, $rango_chart);
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($id)) {
        $responseData = Sensor::deleteSensor($id);
    } else if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($tipoSensor)) {
        $responseData = Sensor::tipoSensor();
    } else {
        $responseData = Sensor::getSensor();
    }

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

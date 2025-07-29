<?php

require './Class/Estaciones.php';

header('Content-Type: application/json');

try {
    if (isset($_GET['id']))  {
        if (!empty($_GET['id'])) {
            $id = $_GET['id'];
           $data = Estaciones::obtenerEstacion($id);
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $data
            ]);
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'El parámetro "id" es requerido.'
            ]);
        }
    } else {
        $data = Estaciones::getEstacion();
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $data
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener las estaciones.',
        'error' => $e->getMessage()
    ]);
}


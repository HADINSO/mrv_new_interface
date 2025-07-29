<?php
require 'Class/Router.php';
require 'Class/Header.php';

Header::Cors();

Router::get('mrv/v1/estaciones', function() {
    require 'Controllers/estacionesController.php';
});

Router::post('mrv/v1/delete/estaciones', function() {
    require 'Controllers/deleteEstacionesController.php';
});

Router::get('mrv/v1/obtenerEstacion', function() {
    require 'Controllers/estacionesController.php';
});

Router::post('mrv/v1/delete-sensor', function () {
    require 'Controllers/deleteSensorController.php';
});

Router::post('mrv/v1/charts', function() {
    require 'Controllers/graficosController.php';
});

Router::get('mrv/v1/tipo_sensor', function() {
    $tipoSensor = 0;
    require 'Controllers/sensorController.php';
});

Router::post('mrv/v1/add/sensor', function() {
    require 'Controllers/sensorController.php';
});

Router::get('mrv/v1/sensor', function() {
    require 'Controllers/sensorController.php';
});

Router::post('mrv/v1/sensor/:estacion', function($estacion) {
    require 'Controllers/sensorController.php';
});

Router::get('mrv/v1/sensor-estacion', function() {
    require 'Controllers/sensorEstacionController.php';
});

Router::post('mrv/v1/sensor-estacion-delete', function() {
    require 'Controllers/sensorEstacionDeleteController.php';
});

Router::get('mrv/v1/add/sensor-estacion', function() {
    require 'Controllers/sensorEstacionController.php';
});

Router::post('mrv/v1/add/estacion', function() {
    require 'Controllers/estacionController.php';
});

Router::get('mrv/v1/tipos-estacion', function() {
    require 'Controllers/tiposEstacion.php';
});

//Lecturas
Router::post('mrv/v1/obtenerLecturas', function() {
    require 'Controllers/obtenerLecturaController.php';
});


Router::handleRequest();
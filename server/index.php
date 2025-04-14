<?php
require 'Class/Router.php';


Router::get('mrv/v1/estaciones', function() {
    require 'Controllers/estacionesController.php';
});


Router::handleRequest();
<?php
require 'Class/Router.php';
require 'Class/Header.php';

Header::Cors();

Router::get('mrv/v1/estaciones', function() {
    require 'Controllers/estacionesController.php';
});


Router::handleRequest();
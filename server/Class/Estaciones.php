<?php

require './Config/Database.php';

class Estaciones
{
    public static function getEstacion(): array
    {
        try {
            $pdo = Database::connect();
            $stmt = $pdo->query("
            SELECT e.id AS id,
                e.nombre AS nombre,
                e.descripcion AS descripcion,
                e.lat AS lat,
                e.lng AS lng,
                te.id AS id_tipo_estacion,
                te.nombre AS tipo_estacion
            FROM estacion AS e
            JOIN tipo_estacion AS te ON te.id = e.tipo_estacion
            ");
            $result = $stmt->fetchAll();
            return $result;
        } catch (Exception $e) {
            throw new RuntimeException('Error al obtener estaciones: ' . $e->getMessage());
        }
    }
}

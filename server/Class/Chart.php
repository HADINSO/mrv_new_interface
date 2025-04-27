<?php

require './Config/Database.php';

class Chart
{
    public static function allChart(): array
    {
        try {
            $pdo = Database::connect();
            $stmt = $pdo->query("SELECT * FROM graficos");
            $result = $stmt->fetchAll();
            return $result;
        } catch (Exception $e) {
            throw new RuntimeException('Error al obtener estaciones: ' . $e->getMessage());
        }
    }
    public static function addSensor($nombre, $minimo, $maximo, $codigo, $grafico, $tipo_sensor, $rango_chart): array
    {
        try {
            // Conectar a la base de datos
            $pdo = Database::connect();

            // Preparar la consulta SQL para insertar un nuevo sensor
            $query = "INSERT INTO sensor (nombre, minimo, maximo, codigo, grafico, tipo_sensor, rango_chart) 
                      VALUES (:nombre, :minimo, :maximo, :codigo, :grafico, :tipo_sensor, :rango_chart)";

            $stmt = $pdo->prepare($query);

            // Vincular los parámetros
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':minimo', $minimo);
            $stmt->bindParam(':maximo', $maximo);
            $stmt->bindParam(':codigo', $codigo);
            $stmt->bindParam(':grafico', $grafico);
            $stmt->bindParam(':tipo_sensor', $tipo_sensor);
            $stmt->bindParam(':rango_chart', $rango_chart);

            // Ejecutar la consulta
            $stmt->execute();

            // Retornar un mensaje de éxito o una estructura similar
            return ['message' => 'Sensor creado exitosamente'];
        } catch (Exception $e) {
            // Manejar cualquier error
            throw new RuntimeException('Error al crear sensor: ' . $e->getMessage());
        }
    }
}

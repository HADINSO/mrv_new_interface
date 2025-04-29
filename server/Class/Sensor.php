<?php

require './Config/Database.php';

class Sensor
{
    public static function getSensor(): array
    {
        try {
            $pdo = Database::connect();
            $stmt = $pdo->query("
           SELECT s.id AS id,
                s.nombre AS nombre,
                s.minimo AS minimo,
                s.maximo AS maximo,
                s.codigo AS codigo,
                s.rango_chart AS rango_chart,
                g.id AS id_grafico,
                g.nombre AS nombre_grafico,
                ts.id AS id_tipo_sensor,
                ts.nombre AS nombre_tipo_sensor
            FROM sensor AS s
            JOIN graficos AS g ON g.id = s.grafico
            JOIN tipo_sensor AS ts ON ts.id = s.tipo_sensor
            ");
            $result = $stmt->fetchAll();
            return $result;
        } catch (Exception $e) {
            throw new RuntimeException('Error al obtener estaciones: ' . $e->getMessage());
        }
    }
    public static function tipoSensor(): array
    {
        try {
            $pdo = Database::connect();
            $stmt = $pdo->query("SELECT * FROM tipo_sensor");
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
    public static function deleteSensorEstacion($id): array
    {
        try {
            // Conectar a la base de datos
            $pdo = Database::connect();

            // Preparar la consulta SQL para insertar un nuevo sensor
            $query = "DELETE FROM estacion_sensor WHERE sensor = :id";

            $stmt = $pdo->prepare($query);

            // Vincular los parámetros
            $stmt->bindParam(':id', $id);

            // Ejecutar la consulta
            $stmt->execute();

            // Retornar un mensaje de éxito o una estructura similar
            return ['message' => 'Sensor creado exitosamente'];
        } catch (Exception $e) {
            // Manejar cualquier error
            throw new RuntimeException('Error al crear sensor: ' . $e->getMessage());
        }
    }
    public static function deleteSensor($id): array
    {
        try {
            // Conectar a la base de datos
            $pdo = Database::connect();

            // Preparar la consulta SQL para insertar un nuevo sensor
            $query = "DELETE FROM sensor WHERE id = :id;";

            $stmt = $pdo->prepare($query);

            // Vincular los parámetros
            $stmt->bindParam(':id', $id);

            // Ejecutar la consulta
            $stmt->execute();

            // Retornar un mensaje de éxito o una estructura similar
            return ['message' => 'Sensor creado exitosamente'];
        } catch (Exception $e) {
            // Manejar cualquier error
            throw new RuntimeException('Error al crear sensor: ' . $e->getMessage());
        }
    }
    public static function getSensorEstacion(int $id): array
    {
        try {
            $pdo = Database::connect();

            $query = "
            SELECT 
            s.id AS id,
            s.nombre AS nombre,
            s.codigo AS codigo,
            t.nombre AS tipo_sensor
            FROM estacion_sensor AS es
            JOIN estacion AS e ON e.id = es.estacion
            JOIN sensor AS s ON s.id = es.sensor
            JOIN tipo_sensor AS t ON t.id = s.tipo_sensor
            WHERE es.estacion = :id
            ";

            $stmt = $pdo->prepare($query);
            // Vincular los parámetros
            $stmt->bindParam(':id', $id);
            // Ejecutar la consulta
            $stmt->execute();

            // Retornar un mensaje de éxito o una estructura similar
            return $result = $stmt->fetchAll();
        } catch (Exception $e) {
            // Manejar cualquier error
            throw new RuntimeException('Error al crear sensor: ' . $e->getMessage());
        }
    }
    public static function addSensorEstacion(): string
    {
        return "string";
    }
}

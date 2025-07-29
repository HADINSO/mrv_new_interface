<?php

require './Config/Database.php';

class Estaciones
{
        public static function deleteEstacion($id): array
    {
        try {
            // Conectar a la base de datos
            $pdo = Database::connect();

            // Preparar la consulta SQL para insertar un nuevo sensor
            $query = "DELETE FROM estacion WHERE id = :id;";

            $stmt = $pdo->prepare($query);

            // Vincular los parámetros
            $stmt->bindParam(':id', $id);

            // Ejecutar la consulta
            $stmt->execute();

            // Retornar un mensaje de éxito o una estructura similar
            return ['message' => 'Estacion eliminada exitosamente'];
        } catch (Exception $e) {
            // Manejar cualquier error
            throw new RuntimeException('Error al crear sensor: ' . $e->getMessage());
        }
    }
    public static function obtenerEstacion(int $id): array
    {
        try {
            $pdo = Database::connect();
            $stmt = $pdo->prepare("
                SELECT e.id AS id,
                    e.nombre AS nombre,
                    e.descripcion AS descripcion,
                    e.lat AS lat,
                    e.lng AS lng,
                    te.id AS id_tipo_estacion,
                    te.nombre AS tipo_estacion_nombre,
                    e.estacion_mrv AS estacion_mrv
                FROM estacion AS e
                JOIN tipo_estacion AS te ON te.id = e.tipo_estacion
                WHERE e.id = :id
            ");
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $result;
        } catch (Exception $e) {
            throw new RuntimeException('Error al obtener la estación: ' . $e->getMessage());
        }
    }

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
    public static function crear($data)
    {
        $pdo = Database::connect();
        $sql = "INSERT INTO estacion (nombre, descripcion, lat, lng, tipo_estacion, images)
                VALUES (:nombre, :descripcion, :lat, :lng, :id_tipo_estacion, :imagen)";
        $stmt = $pdo->prepare($sql);
        return $stmt->execute([
            ':nombre' => $data['nombre'],
            ':descripcion' => $data['descripcion'],
            ':lat' => $data['lat'],
            ':lng' => $data['lng'],
            ':id_tipo_estacion' => $data['id_tipo_estacion'],
            ':imagen' => $data['imagen'],
        ]);
    }
    public static function tipoEstacion()
    {
        $pdo = Database::connect();
        $sql = "SELECT * FROM tipo_estacion";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
         
    } 
    public static function obtenerLectura($codigo, $estacion, $cantidad)
    {
        try {
            $pdo = Database::connect();
            $sql = "SELECT
                l.id AS id,
                l.fecha AS fecha,
                l.hora AS hora,
                l.lectura AS lecturas,
                l.estacion AS estacion
            FROM
                lecturas AS l
            WHERE
                l.estacion = :estacion AND l.lectura LIKE '%:codigo%'
            LIMIT :cantidad";
            $stmt = $pdo->prepare($sql);
            $resultado = $stmt->execute([
                ':estacion' => $estacion,
                ':codigo' => $codigo,
                ':cantidad' => $cantidad,
            ]);
            Database::disconnect();
            return json_encode($resultado);
        } catch (PDOException $e) {
            // Puedes loguear el error o devolver false directamente
            error_log("Error al insertar lectura: " . $e->getMessage());
            return false;
        }
    }
}

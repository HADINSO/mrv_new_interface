<?php

require '../nuevo/Config/Database.php';

class Lecturas
{
    public static function crearLectura($lectura, $hora, $fecha, $estacion)
    {
        try {
            $pdo = Database::connect();
            $sql = "INSERT INTO lecturas (fecha, hora, lectura, estacion)
                    VALUES (:fecha, :hora, :lectura, :estacion)";
            $stmt = $pdo->prepare($sql);
            $resultado = $stmt->execute([
                ':fecha' => $fecha,
                ':hora' => $hora,
                ':lectura' => $lectura,
                ':estacion' => $estacion,
            ]);
            Database::disconnect(); // Asegúrate de que este método exista en tu clase Database
            return $resultado;
        } catch (PDOException $e) {
            // Puedes loguear el error o devolver false directamente
            error_log("Error al insertar lectura: " . $e->getMessage());
            return false;
        }
    }

}

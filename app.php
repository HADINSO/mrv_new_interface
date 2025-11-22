<?php
class Estaciones
{
    private $conexion;

    public function __construct($conexion)
    {
        $this->conexion = $conexion;
    }

    public function actualizarEstacion($id, $nombre, $descripcion)
    {
        $sql = "UPDATE estaciones SET nombre = ?, descripcion = ? WHERE id = ?";
        $stmt = $this->conexion->prepare($sql);
        $stmt->bind_param('ssi', $nombre, $descripcion, $id);
        $stmt->execute();
        return $stmt->affected_rows;
    }

    public function getReports($page = 1)
    {
        $limit = 10;
        $offset = ($page - 1) * $limit;

        $sql = "SELECT * FROM reportes LIMIT ? OFFSET ?";

        if ($stmt = $this->conexion->prepare($sql)) {
            $stmt->bind_param('ii', $limit, $offset);

            $stmt->execute();

            $result = $stmt->get_result();

            $reports = [];

            while ($row = $result->fetch_assoc()) {
                $reports[] = $row;
            }

            $stmt->close();

            return json_encode($reports);
        } else {
            return json_encode(['error' => 'Error al preparar la consulta: ' . $this->conexion->error]);
        }
    }


    public function downloadVariable($estado, $codigo)
    {
        // Modificar la consulta SQL para eliminar REGEXP_SUBSTR
        $sql = "SELECT
                       l.id AS id,
                       l.lectura AS lectura,  -- Aquí obtenemos el valor completo
                       l.fecha_hora AS fecha_hora
                FROM
                    lecturas AS l
                WHERE l.estacion = ? 
                  AND l.lectura LIKE ?
                  AND l.lectura >= 0";

        // Preparar la sentencia
        $stmt = $this->conexion->prepare($sql);

        // Verificar si la preparación fue exitosa
        if ($stmt === false) {
            return json_encode(['error' => 'Error en la preparación de la consulta: ' . $this->conexion->error]);
        }

        // Preparar los valores para el bind
        $likeCodigo = "%$codigo%";

        // Enlazar parámetros
        $stmt->bind_param('ss', $estado, $likeCodigo);

        // Ejecutar la consulta
        if (!$stmt->execute()) {
            return json_encode(['error' => 'Error en la ejecución de la consulta: ' . $stmt->error]);
        }

        // Obtener el resultado
        $result = $stmt->get_result();
        $rows = [];

        // Procesar los resultados para extraer solo la parte numérica de `lectura`
        while ($row = $result->fetch_assoc()) {
            // Extraer la parte numérica de `lectura` usando una expresión regular en PHP
            if (preg_match('/^[0-9]+(?:\.[0-9]+)?/', $row['lectura'], $matches)) {
                $row['lectura'] = $matches[0];
            }
            $rows[] = $row;
        }

        // Cerrar la declaración
        $stmt->close();

        // Devolver el resultado como JSON
        return json_encode($rows);
    }


    public function download_var_fechas($estado, $codigo, $inicio, $fin)
    {
        // Modificar la consulta SQL para eliminar REGEXP_SUBSTR
        $sql = "SELECT
                       l.id AS id,
                       l.lectura AS lectura,  -- Obtenemos el valor completo
                       l.fecha_hora AS fecha_hora
                FROM
                    lecturas AS l
                WHERE l.estacion = ? 
                  AND l.lectura LIKE ? 
                  AND DATE(l.fecha_hora) BETWEEN ? AND ? 
                  AND l.lectura >= 0";

        // Preparar la sentencia
        $stmt = $this->conexion->prepare($sql);

        // Verificar si la preparación fue exitosa
        if ($stmt === false) {
            return json_encode(['error' => 'Error en la preparación de la consulta: ' . $this->conexion->error]);
        }

        // Preparar los valores para el bind
        $likeCodigo = "%$codigo%";

        // Enlazar parámetros
        $stmt->bind_param('ssss', $estado, $likeCodigo, $inicio, $fin);

        // Ejecutar la consulta
        if (!$stmt->execute()) {
            return json_encode(['error' => 'Error en la ejecución de la consulta: ' . $stmt->error]);
        }

        // Obtener el resultado
        $result = $stmt->get_result();
        $rows = [];

        // Procesar los resultados para extraer solo la parte numérica de `lectura`
        while ($row = $result->fetch_assoc()) {
            // Extraer la parte numérica de `lectura` usando una expresión regular en PHP
            if (preg_match('/^[0-9]+(?:\.[0-9]+)?/', $row['lectura'], $matches)) {
                $row['lectura'] = $matches[0];
            }
            $rows[] = $row;
        }

        // Cerrar la declaración
        $stmt->close();

        // Devolver el resultado como JSON
        return json_encode($rows);
    }


    public function num_rows_var_fechas($estado, $codigo, $inicio, $fin)
    {
        // Preparar la consulta
        $sql = "SELECT COUNT(l.id) AS numero
                FROM lecturas AS l
                WHERE l.estacion = ? 
                  AND l.lectura LIKE ? 
                  AND DATE(l.fecha_hora) BETWEEN ? AND ? 
                  AND l.lectura >= 0";

        // Preparar la sentencia
        $stmt = $this->conexion->prepare($sql);

        // Verificar si la preparación fue exitosa
        if ($stmt === false) {
            // Devolver un error en formato JSON
            return json_encode(['error' => 'Error en la preparación de la consulta: ' . $this->conn->error]);
        }

        // Preparar los valores para el bind
        $likeCodigo = "%$codigo%";

        // Enlazar parámetros
        $stmt->bind_param('ssss', $estado, $likeCodigo, $inicio, $fin);

        // Ejecutar la consulta
        if (!$stmt->execute()) {
            // Devolver un error en formato JSON si la ejecución falla
            return json_encode(['error' => 'Error en la ejecución de la consulta: ' . $stmt->error]);
        }

        // Obtener el resultado
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();

        // Cerrar la declaración
        $stmt->close();

        // Devolver el resultado como JSON
        return json_encode(['numero' => $row['numero']]);
    }

    public function toggleVariableEstacion($id, $estado)
    {

        // Preparar la consulta
        $sql = "UPDATE variables SET estado = ? WHERE id = ?";
        $stmt = $this->conexion->prepare($sql);

        // Verificar si la consulta fue preparada correctamente
        if ($stmt === false) {
            return [
                'status' => 'error',
                'message' => 'Error al preparar la consulta: ' . $this->conn->error
            ];
        }

        // Vincular los parámetros
        $stmt->bind_param('si', $estado, $id);

        // Ejecutar la consulta
        $result = $stmt->execute();

        // Verificar si la ejecución fue exitosa
        if ($result === false) {
            return [
                'status' => 'error',
                'message' => 'Error al ejecutar la consulta: ' . $stmt->error
            ];
        }

        // Cerrar la declaración
        $stmt->close();

        // Retornar un mensaje de confirmación
        return [
            'status' => 'success',
            'message' => 'El estado de la estación ha sido actualizado exitosamente.'
        ];
    }

    public function toggleVariable($estacion)
    {
        $sql = "SELECT
                    v.id AS id,
                    v.estado AS estado
                FROM
                    variables AS v
                WHERE
                    v.id = ?";

        // Preparar la declaración
        if ($stmt = $this->conexion->prepare($sql)) {
            // Enlazar el parámetro
            $stmt->bind_param('i', $estacion);

            // Ejecutar la declaración
            $stmt->execute();

            // Obtener el resultado
            $result = $stmt->get_result();

            // Verificar si se encontraron resultados
            if ($result->num_rows > 0) {
                // Devolver los resultados como un array asociativo
                $data = $result->fetch_assoc();
                return json_encode($data);
            } else {
                return json_encode(['error' => 'Estación no encontrada']);
            }

            // Cerrar la declaración
            $stmt->close();
        } else {
            // Manejo de errores de preparación
            return json_encode(['error' => 'Error al preparar la consulta: ' . $this->conn->error]);
        }
    }

    public function numRowsVariable($id, $codigo)
    {
        // Preparar la consulta
        $sql = "SELECT COUNT(l.id) AS numero
                FROM lecturas AS l
                WHERE l.estacion = ? AND l.lectura LIKE ? AND NOT l.lectura <= 0";

        // Preparar la sentencia
        $stmt = $this->conexion->prepare($sql);

        // Verificar si la preparación fue exitosa
        if ($stmt === false) {
            // Devolver un error en formato JSON
            return json_encode(['error' => 'Error en la preparación de la consulta: ' . $this->conn->error]);
        }

        // Preparar los valores para el bind
        $likeCodigo = "%$codigo%";

        // Enlazar parámetros
        $stmt->bind_param('ss', $id, $likeCodigo);

        // Ejecutar la consulta
        $stmt->execute();

        // Obtener el resultado
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();

        // Cerrar la declaración
        $stmt->close();

        // Devolver el resultado como JSON
        return json_encode(['numero' => $row['numero']]);
    }

    public function variables($id)
    {
        $sql = "SELECT
                    v.id AS id,
                    v.nombre AS nombre,
                    v.codigo AS codigo
                FROM 
                    variables AS v
                WHERE
                    v.estacion = ?";

        // Preparar la declaración SQL
        $stmt = $this->conexion->prepare($sql);

        // Comprobar si la preparación fue exitosa
        if ($stmt === false) {
            return json_encode(['error' => 'Error al preparar la consulta SQL.']);
        }

        // Vincular el parámetro y ejecutar la declaración
        $stmt->bind_param('s', $id);
        $stmt->execute();

        // Obtener el resultado
        $result = $stmt->get_result();

        // Verificar si hay resultados
        if ($result->num_rows > 0) {
            $variables = [];

            // Recorrer los resultados y almacenarlos en un array
            while ($row = $result->fetch_assoc()) {
                $variables[] = $row;
            }

            // Retornar los resultados como JSON
            return json_encode($variables);
        } else {
            return json_encode(['error' => 'No se encontraron resultados.']);
        }
    }

    public function numRowsEstacion($estacion)
    {
        // Preparar la consulta SQL utilizando parámetros para evitar inyecciones SQL
        $sql = "SELECT COUNT(l.id) AS numero
                FROM lecturas AS l
                WHERE l.estacion = ? AND l.lectura > 0";

        // Preparar la consulta
        $stmt = $this->conexion->prepare($sql);

        // Enlazar parámetros
        $stmt->bind_param("s", $estacion);

        // Ejecutar la consulta
        $stmt->execute();

        // Obtener el resultado
        $result = $stmt->get_result();

        // Verificar si hay resultados
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $numero = $row['numero'];
        } else {
            $numero = 0;
        }

        // Cerrar la consulta preparada
        $stmt->close();

        // Devolver el resultado en formato JSON
        return json_encode(['numero' => $numero]);
    }

    public function toggleUpdate($id, $estado)
    {

        // Preparar la consulta
        $sql = "UPDATE estacion SET estado = ? WHERE id = ?";
        $stmt = $this->conexion->prepare($sql);

        // Verificar si la consulta fue preparada correctamente
        if ($stmt === false) {
            return [
                'status' => 'error',
                'message' => 'Error al preparar la consulta: ' . $this->conn->error
            ];
        }

        // Vincular los parámetros
        $stmt->bind_param('si', $estado, $id);

        // Ejecutar la consulta
        $result = $stmt->execute();

        // Verificar si la ejecución fue exitosa
        if ($result === false) {
            return [
                'status' => 'error',
                'message' => 'Error al ejecutar la consulta: ' . $stmt->error
            ];
        }

        // Cerrar la declaración
        $stmt->close();

        // Retornar un mensaje de confirmación
        return [
            'status' => 'success',
            'message' => 'El estado de la estación ha sido actualizado exitosamente.'
        ];
    }

    public function toggle($estacion)
    {
        $sql = "SELECT
                    e.id AS id,
                    es.estado
                FROM
                    estacion AS e
                JOIN estado AS es
                ON
                    es.id = e.estado
                WHERE
                    e.id = ?";

        // Preparar la declaración
        if ($stmt = $this->conexion->prepare($sql)) {
            // Enlazar el parámetro
            $stmt->bind_param('i', $estacion);

            // Ejecutar la declaración
            $stmt->execute();

            // Obtener el resultado
            $result = $stmt->get_result();

            // Verificar si se encontraron resultados
            if ($result->num_rows > 0) {
                // Devolver los resultados como un array asociativo
                $data = $result->fetch_assoc();
                return json_encode($data);
            } else {
                return json_encode(['error' => 'Estación no encontrada']);
            }

            // Cerrar la declaración
            $stmt->close();
        } else {
            // Manejo de errores de preparación
            return json_encode(['error' => 'Error al preparar la consulta: ' . $this->conn->error]);
        }
    }

    private function executeQuery($sql, $params, $param_types)
    {
        if ($stmt = $this->conexion->prepare($sql)) {
            // Vincular los parámetros
            $stmt->bind_param($param_types, ...$params);

            // Ejecutar la declaración
            if ($stmt->execute()) {
                // Obtener los resultados
                $result = $stmt->get_result();
                // Cerrar la declaración
                $stmt->close();

                return $result;
            } else {
                // Manejo de errores en la ejecución
                throw new Exception("Error en la ejecución de la declaración: " . $stmt->error);
            }
        } else {
            // Manejo de errores en la preparación
            throw new Exception("Error en la preparación de la declaración: " . $this->conexion->error);
        }
    }

    public function estadoEstacionSetting($estacion)
    {
        // Consulta SQL
        $sql = "SELECT
                    l.id AS id,
                    DATE(l.fecha_hora) AS fecha,
                    l.hora AS hora
                FROM
                    lecturas AS l
                WHERE
                    l.estacion = ?
                ORDER BY
                    l.id DESC
                LIMIT 1";

        // Parámetros de la consulta
        $params = [$estacion];
        $param_types = "s";

        // Ejecutar la consulta utilizando el nuevo método
        $result = $this->executeQuery($sql, $params, $param_types);

        // Verificar si hay resultados
        if ($result->num_rows > 0) {
            $lectura = $result->fetch_assoc();
        } else {
            $lectura = null;
        }

        // Retornar el resultado en formato JSON
        return json_encode($lectura);

    }

    // Método para obtener estaciones activas
    public function obtenerEstaciones()
    {
        $query = "SELECT
            id,
            nombre,
            latitud AS lat,
            longitud AS lng,
            descripcion AS descripcion,
            thumb AS thumb
        FROM
            estacion
        WHERE
            estado = 1";
        $resultado = $this->conexion->query($query);

        $estaciones = array();
        while ($fila = $resultado->fetch_assoc()) {
            $estaciones[] = $fila;
        }

        return $estaciones;
    }

    // Método para obtener todas las estaciones
    public function obtenerEstacionesTodas()
    {
        $query = "SELECT
            id,
            nombre,
            latitud AS lat,
            longitud AS lng,
            descripcion AS descripcion,
            thumb AS thumb
        FROM
            estacion";
        $resultado = $this->conexion->query($query);

        $estaciones = array();
        while ($fila = $resultado->fetch_assoc()) {
            $estaciones[] = $fila;
        }

        return $estaciones;
    }

    // Método para obtener el estado de la estacion solicitada
    public function estadoEstacion($estacion)
    {
        // Preparar la consulta SQL con marcadores de posición
        $sql = "SELECT
                    l.id AS id,
                    DATE(l.fecha_hora) AS fecha,
                    l.hora AS hora
                FROM
                    lecturas AS l
                WHERE
                    l.estacion = ?
                ORDER BY
                    l.id DESC
                LIMIT 1";

        // Preparar la declaración
        if ($stmt = $this->conexion->prepare($sql)) {
            // Vincular el parámetro
            $stmt->bind_param("s", $estacion);

            // Ejecutar la declaración
            $stmt->execute();

            // Obtener los resultados
            $result = $stmt->get_result();

            // Cerrar la declaración
            $stmt->close();

            return $result;
        } else {
            // Manejo de errores
            throw new Exception("Error en la preparación de la declaración: " . $this->conexion->error);
        }
    }

    public function obtenerEstacionUnica($estacion)
    {
        // Preparar la consulta SQL con marcadores de posición
        $sql = "SELECT
                    e.id AS id,
                    e.nombre AS nombre,
                    e.descripcion AS descripcion,
                    e.fecha_creacion AS fecha,
                    e.thumb AS thumb,
                    e.Latitud AS Latitud,
                    e.longitud AS longitud,
                    e.estado AS estado
                FROM
                    estacion AS e
                WHERE e.id = ?";

        // Preparar la declaración
        if ($stmt = $this->conexion->prepare($sql)) {
            // Vincular el parámetro
            $stmt->bind_param("i", $estacion);

            // Ejecutar la declaración
            $stmt->execute();

            // Obtener los resultados
            $result = $stmt->get_result();

            // Verificar si se encontraron registros
            if ($result->num_rows > 0) {
                // Convertir el resultado a un array asociativo
                $estacionData = $result->fetch_assoc();
            } else {
                // No se encontraron registros
                $estacionData = array('mensaje' => 'No se ha encontrado la estación.');
            }

            // Cerrar la declaración
            $stmt->close();
        } else {
            // Manejo de errores
            $estacionData = array('mensaje' => 'Error en la preparación de la declaración: ' . $this->conexion->error);
        }

        // Devolver el resultado en formato JSON
        return json_encode($estacionData);
    }

    public function obtenerEstacionDetail($estacion)
    {
        // Preparar la consulta SQL con marcadores de posición
        $sql = "SELECT
                    v.id AS id,
                    v.nombre AS nombre,
                    v.codigo AS codigo
                FROM 
                    variables AS v
                WHERE
                    v.estacion = ? AND v.estado = 0";

        // Preparar la declaración
        if ($stmt = $this->conexion->prepare($sql)) {
            // Vincular el parámetro
            $stmt->bind_param("s", $estacion);

            // Ejecutar la declaración
            $stmt->execute();

            // Obtener los resultados
            $result = $stmt->get_result();

            // Cerrar la declaración
            $stmt->close();

            return $result;
        } else {
            // Manejo de errores
            throw new Exception("Error en la preparación de la declaración: " . $this->conexion->error);
        }
    }

    public function PreviewDetailCharts($estacion, $codigo)
    {
        $sql = "
                SELECT
            l.id AS id,
            l.lectura AS lectura,
            l.hora AS hora,
            l.fecha_hora AS fecha
        FROM
            lecturas AS l
        WHERE
            l.estacion = ? AND l.lectura LIKE ? AND NOT l.lectura < 0
        ORDER BY
            l.id
        DESC
        LIMIT 5";

        // Preparar la declaración SQL
        $stmt = $this->conexion->prepare($sql);
        if ($stmt === false) {
            die(json_encode(['error' => 'Error preparando la declaración: ' . $this->conn->error]));
        }

        // Añadir % al código para la cláusula LIKE
        $codigoLike = '%' . $codigo . '%';

        // Vincular los parámetros
        $stmt->bind_param('ss', $estacion, $codigoLike);

        // Ejecutar la declaración
        $stmt->execute();

        // Obtener el resultado
        $result = $stmt->get_result();

        // Verificar errores en la ejecución
        if ($result === false) {
            die(json_encode(['error' => 'Error ejecutando la declaración: ' . $stmt->error]));
        }

        // Fetch all results
        $rows = $result->fetch_all(MYSQLI_ASSOC);

        // Cerrar la declaración
        $stmt->close();
        $rowsReverse = array_reverse($rows);
        // Retornar los resultados en formato JSON
        return json_encode($rowsReverse);
    }

    public function PreviewDetailChartsAdvanced($estacion, $codigo)
    {
        $sql = "SELECT
                    l.id AS id,
                    l.lectura AS lectura,
                    l.hora AS hora,
                    l.fecha_hora AS fecha
                FROM
                    lecturas AS l
                WHERE
                    l.estacion = ? AND l.lectura LIKE ? AND l.lectura >= 0
                ORDER BY l.id DESC
                LIMIT 15";

        // Preparar la declaración SQL
        $stmt = $this->conexion->prepare($sql);
        if ($stmt === false) {
            die(json_encode(['error' => 'Error preparando la declaración: ' . $this->conn->error]));
        }

        // Añadir % al código para la cláusula LIKE
        $codigoLike = '%' . $codigo . '%';

        // Vincular los parámetros
        $stmt->bind_param('ss', $estacion, $codigoLike);

        // Ejecutar la declaración
        $stmt->execute();

        // Obtener el resultado
        $result = $stmt->get_result();

        // Verificar errores en la ejecución
        if ($result === false) {
            die(json_encode(['error' => 'Error ejecutando la declaración: ' . $stmt->error]));
        }

        // Fetch all results
        $rows = $result->fetch_all(MYSQLI_ASSOC);

        // Cerrar la declaración
        $stmt->close();

        $rowsReverse = array_reverse($rows);

        // Retornar los resultados en formato JSON
        return json_encode($rowsReverse);
    }

    public function PreviewDetailChartsAdvancedSolar($estacion, $codigo)
    {
        $sql = "SELECT
                    l.id AS id,
                    l.lectura AS lectura,
                    l.hora AS hora,
                    l.fecha_hora AS fecha
                FROM
                    lecturas AS l
                WHERE
                    l.estacion = ? AND l.lectura LIKE ? AND l.lectura >= 0
                ORDER BY l.id DESC
                LIMIT 5000"; //600 es lo dieal para el promedio del dia en el line chart

        // Preparar la declaración SQL
        $stmt = $this->conexion->prepare($sql);
        if ($stmt === false) {
            die(json_encode(['error' => 'Error preparando la declaración: ' . $this->conn->error]));
        }

        // Añadir % al código para la cláusula LIKE
        $codigoLike = '%' . $codigo . '%';

        // Vincular los parámetros
        $stmt->bind_param('ss', $estacion, $codigoLike);

        // Ejecutar la declaración
        $stmt->execute();

        // Obtener el resultado
        $result = $stmt->get_result();

        // Verificar errores en la ejecución
        if ($result === false) {
            die(json_encode(['error' => 'Error ejecutando la declaración: ' . $stmt->error]));
        }

        // Fetch all results
        $rows = $result->fetch_all(MYSQLI_ASSOC);

        // Cerrar la declaración
        $stmt->close();

        $rowsReverse = array_reverse($rows);

        // Retornar los resultados en formato JSON
        return json_encode($rowsReverse);
    }


    public function octenerVientos($estacion, $codigo)
    {
        $sql = "SELECT
                    l.id AS id,
                    l.lectura AS velocidad,
                    l.hora AS hora
                FROM
                    lecturas AS l
                WHERE
                    l.estacion = '$estacion' AND l.lectura LIKE '%$codigo%' AND NOT l.lectura < 0
                    ORDER BY l.id DESC
                Limit 100";
        $sqlPreparada = mysqli_query($this->conexion, $sql);
        return $sqlPreparada;
    }

    public function obtenerDirecciones($estacion, $codigo)
    {
        $sql = "SELECT
                    l.id AS id,
                    l.lectura AS direccion,
                    l.hora AS hora
                FROM
                    lecturas AS l
                WHERE
                    l.estacion = '$estacion' AND l.lectura LIKE '%$codigo%' AND NOT l.lectura < 0
                    ORDER BY l.id DESC
                Limit 100";
        $sqlPreparada = mysqli_query($this->conexion, $sql);
        return $sqlPreparada;
    }

    public function obtenerDatosTabla($id, $codigo, $fecha)
    {
        $lecturas = $this->obtenerLecturas($id, $codigo, $fecha);
        $moda = $this->obtenerModa($id, $codigo, $fecha, 'DESC');
        $moda2 = $this->obtenerModa($id, $codigo, $fecha, 'ASC');

        $resultado = [
            'Minimo' => $lecturas['Minimo'],
            'Maximo' => $lecturas['Maximo'],
            'Promedio' => round($lecturas['Promedio'], 2),
            'Valor_Mas_Frecuente' => $moda['valor'],
            'Frecuencia_Valor_Mas_Frecuente' => $moda['cantidad'],
            'Valor_Menos_Frecuente' => $moda2['valor'],
            'Frecuencia_Valor_Menos_Frecuente' => $moda2['cantidad']
        ];

        return json_encode($resultado);
    }

    private function obtenerLecturas($id, $codigo, $fecha)
    {
        $sql = "SELECT
                    MIN(lectura_numerica) AS Minimo,
                    MAX(lectura_numerica) AS Maximo,
                    AVG(lectura_numerica) AS Promedio
                FROM (
                    SELECT
                        CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(lectura, 'V', 1), ' ', -1) AS DECIMAL(10,2)) AS lectura_numerica
                    FROM
                        lecturas
                    WHERE
                        estacion = ? AND lectura LIKE ? AND NOT lectura < 0 AND DATE(fecha_hora) BETWEEN ? AND ?
                ) AS lecturas_numericas";

        $stmt = $this->conexion->prepare($sql);
        $likeCodigo = "%$codigo%";
        $stmt->bind_param('ssss', $id, $likeCodigo, $fecha, $fecha);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }

    private function obtenerModa($id, $codigo, $fecha, $orden)
    {
        $sql = "SELECT
                    valor,
                    COUNT(*) AS cantidad
                FROM (
                    SELECT
                        CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(lectura, 'V', 1), ' ', -1) AS DECIMAL(10,2)) AS valor
                    FROM
                        lecturas
                    WHERE
                        estacion = ? AND lectura LIKE ? AND NOT lectura < 0 AND DATE(fecha_hora) BETWEEN ? AND ?
                ) AS lecturas_sin_caracteres
                GROUP BY
                    valor
                ORDER BY
                    COUNT(*) $orden
                LIMIT 1";

        $stmt = $this->conexion->prepare($sql);
        $likeCodigo = "%$codigo%";
        $stmt->bind_param('ssss', $id, $likeCodigo, $fecha, $fecha);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }


}

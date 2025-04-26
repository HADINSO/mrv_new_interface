<?php

class Header
{
    public static function Cors()
    {
        self::setAllowedOrigins();
        self::setAllowedMethods();
        self::setAllowedHeaders();
        self::setCredentials();
        self::setMaxAge();
        self::handleOptionsRequest();
        self::ApplicationTypeJson();
    }
    private static function ApplicationTypeJson()
    {
        header('Content-Type: application/json');
    }
    private static function setAllowedOrigins()
    {
        // Dominios permitidos
        $allowed_origins = [
            "https://mrvmonitor.com",
            "http://localhost:5173",
            "http://localhost:5174"
        ];
        header("Access-Control-Allow-Origin: *");
        // Verificar si el origen de la solicitud está en la lista de dominios permitidos
        /* if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
            header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
        } else {
            // Responder con un 403 si el origen no está permitido
            echo json_encode(["message" => "Origen no permitido"]);
            exit;
        }*/
    }

    private static function setAllowedMethods()
    {
        // Permitir los métodos GET, POST, PUT y OPTIONS
        header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
    }

    private static function setAllowedHeaders()
    {
        // Permitir los encabezados que se utilizan en la solicitud
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
    }

    private static function setCredentials()
    {
        // Permitir que las credenciales sean enviadas (cookies, autorización JWT, etc.)
        header("Access-Control-Allow-Credentials: true");
    }

    private static function setMaxAge()
    {
        // Establecer el tiempo de vida del preflight request (en segundos)
        header("Access-Control-Max-Age: 3600");
    }

    private static function handleOptionsRequest()
    {
        // Si la solicitud es un OPTIONS, terminar la ejecución del script
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}

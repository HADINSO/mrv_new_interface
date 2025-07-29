<?php

class Database
{

    private static string $host = '162.241.61.138';
    private static string $dbName = 'siste395_mrv_db_interface';
    private static string $username = 'siste395_mrv_user_interface';
    private static string $password = '.{^ojsOG#rua';
      /*
    private static string $host = 'localhost';
    private static string $dbName = 'mrv_db';
    private static string $username = 'root';
    private static string $password = '';
  */
    
    private static ?PDO $connection = null;

    private function __construct() {}

    public static function connect(): PDO
    {
        if (self::$connection === null) {
            try {
                $dsn = 'mysql:host=' . self::$host . ';dbname=' . self::$dbName . ';charset=utf8mb4';
                self::$connection = new PDO($dsn, self::$username, self::$password, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);
            } catch (PDOException $e) {
                throw new RuntimeException('Error de conexión: ' . $e->getMessage());
            }
        }
        return self::$connection;
    }

    public static function disconnect(): void
    {
        self::$connection = null;
    }
}

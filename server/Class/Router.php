<?php

class Router {
    private static $routes = [];

    public static function add($method, $route, $function) {
        self::$routes[] = ['method' => $method, 'route' => $route, 'function' => $function];
    }

    public static function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');

        foreach (self::$routes as $route) {
            if ($route['method'] === $method && preg_match("#^{$route['route']}$#", $uri, $matches)) {
                array_shift($matches); // Remove the full match
                return call_user_func_array($route['function'], $matches);
            }
        }

        header("HTTP/1.0 404 Not Found");
        echo "404 Not Found";
    }

    public static function get($route, $function) {
        self::add('GET', $route, $function);
    }

    public static function post($route, $function) {
        self::add('POST', $route, $function);
    }

    public static function put($route, $function) {
        self::add('PUT', $route, $function);
    }

    public static function delete($route, $function) {
        self::add('DELETE', $route, $function);
    }
}
-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 14-04-2025 a las 16:31:04
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `mrv_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estacion`
--

CREATE TABLE `estacion` (
  `id` int(11) NOT NULL,
  `nombre` text DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `lat` varchar(50) DEFAULT NULL,
  `lng` varchar(50) DEFAULT NULL,
  `tipo_estacion` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estacion`
--

INSERT INTO `estacion` (`id`, `nombre`, `descripcion`, `lat`, `lng`, `tipo_estacion`) VALUES
(1, 'Radiación solar', 'CDASCdscdscdc', '5.7575', '76.7867', 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estacion_sensor`
--

CREATE TABLE `estacion_sensor` (
  `id` int(11) NOT NULL,
  `estacion` int(11) NOT NULL DEFAULT 0,
  `sensor` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `graficos`
--

CREATE TABLE `graficos` (
  `id` int(11) NOT NULL,
  `nombre` char(50) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lecturas`
--

CREATE TABLE `lecturas` (
  `id` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `lectura` varchar(50) NOT NULL DEFAULT '0',
  `sensor` int(11) NOT NULL DEFAULT 0,
  `estacion` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sensor`
--

CREATE TABLE `sensor` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL DEFAULT '0',
  `minimo` varchar(50) NOT NULL DEFAULT '0',
  `maximo` varchar(50) NOT NULL DEFAULT '0',
  `rango` int(11) DEFAULT NULL,
  `grafico` int(11) DEFAULT NULL,
  `tipo_sensor` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_estacion`
--

CREATE TABLE `tipo_estacion` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipo_estacion`
--

INSERT INTO `tipo_estacion` (`id`, `nombre`) VALUES
(1, 'Hidrológico '),
(2, 'Meteorológico'),
(3, 'AiQ'),
(4, 'Otros (Ruidos & Radiación solar)');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_sensor`
--

CREATE TABLE `tipo_sensor` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `estacion`
--
ALTER TABLE `estacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_estacion_tipo_estacion` (`tipo_estacion`);

--
-- Indices de la tabla `estacion_sensor`
--
ALTER TABLE `estacion_sensor`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_estacion_sensor_estacion` (`estacion`),
  ADD KEY `FK_estacion_sensor_sensor` (`sensor`);

--
-- Indices de la tabla `graficos`
--
ALTER TABLE `graficos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `lecturas`
--
ALTER TABLE `lecturas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_lecturas_sensor` (`sensor`),
  ADD KEY `FK_lecturas_estacion` (`estacion`);

--
-- Indices de la tabla `sensor`
--
ALTER TABLE `sensor`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_sensor_tipo_sensor` (`tipo_sensor`),
  ADD KEY `FK_sensor_graficos` (`grafico`);

--
-- Indices de la tabla `tipo_estacion`
--
ALTER TABLE `tipo_estacion`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `tipo_sensor`
--
ALTER TABLE `tipo_sensor`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `estacion`
--
ALTER TABLE `estacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `estacion_sensor`
--
ALTER TABLE `estacion_sensor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `graficos`
--
ALTER TABLE `graficos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `lecturas`
--
ALTER TABLE `lecturas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `sensor`
--
ALTER TABLE `sensor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipo_estacion`
--
ALTER TABLE `tipo_estacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `tipo_sensor`
--
ALTER TABLE `tipo_sensor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `estacion`
--
ALTER TABLE `estacion`
  ADD CONSTRAINT `FK_estacion_tipo_estacion` FOREIGN KEY (`tipo_estacion`) REFERENCES `tipo_estacion` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `estacion_sensor`
--
ALTER TABLE `estacion_sensor`
  ADD CONSTRAINT `FK_estacion_sensor_estacion` FOREIGN KEY (`estacion`) REFERENCES `estacion` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_estacion_sensor_sensor` FOREIGN KEY (`sensor`) REFERENCES `sensor` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `lecturas`
--
ALTER TABLE `lecturas`
  ADD CONSTRAINT `FK_lecturas_estacion` FOREIGN KEY (`estacion`) REFERENCES `estacion` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_lecturas_sensor` FOREIGN KEY (`sensor`) REFERENCES `sensor` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `sensor`
--
ALTER TABLE `sensor`
  ADD CONSTRAINT `FK_sensor_graficos` FOREIGN KEY (`grafico`) REFERENCES `graficos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_sensor_tipo_sensor` FOREIGN KEY (`tipo_sensor`) REFERENCES `tipo_sensor` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

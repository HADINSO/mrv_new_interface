// @ts-nocheck
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  FaSun, FaVolumeUp, FaTemperatureHigh, FaWater, FaArrowUp, FaArrowDown,
  FaSmile, FaMeh, FaFrown
} from "react-icons/fa";
import { GiChemicalDrop, GiDustCloud } from "react-icons/gi";
import { MdCo2 } from "react-icons/md";

interface Estacion {
  id: number;
  nombre: string;
  descripcion: string;
  lat: string;
  lng: string;
  id_tipo_estacion: number;
  tipo_estacion_nombre: string;
}

type Props = { estacion: Estacion };
type SensorData = Record<string, number>;

const icons = {
  radiation: <FaSun className="text-yellow-400 text-3xl" />,
  noise: <FaVolumeUp className="text-blue-400 text-3xl" />,
  co2: <MdCo2 className="text-green-500 text-3xl" />,
  hcho: <GiChemicalDrop className="text-pink-400 text-3xl" />,
  tvoc: <GiChemicalDrop className="text-purple-400 text-3xl" />,
  pm25: <GiDustCloud className="text-orange-400 text-3xl" />,
  pm10: <GiDustCloud className="text-orange-300 text-3xl" />,
  temp: <FaTemperatureHigh className="text-red-400 text-3xl" />,
  humidity: <FaWater className="text-cyan-400 text-3xl" />,
};

const sensores = [
  { key: "radiation", title: "Radiación Solar", code: "V4", unit: "W/m²" },
  { key: "noise", title: "Ruido Ambiental", code: "V6", unit: "db" },
  { key: "co2", title: "CO₂", code: "V12", unit: "ppm" },
  { key: "hcho", title: "HCHO", code: "V11", unit: "mg/m³" },
  { key: "tvoc", title: "TVOC", code: "V15", unit: "mg/m³" },
  { key: "pm25", title: "PM2.5", code: "V1", unit: "µg/m³" },
  { key: "pm10", title: "PM10", code: "V10", unit: "µg/m³" },
  { key: "temp", title: "Temperatura", code: "V5", unit: "°C" },
  { key: "humidity", title: "Humedad", code: "V8", unit: "%" },
];

const getAirQualityLabel = (type: string, value: number) => {
  const ranges: Record<string, [number, number]> = {
    pm25: [12, 35],
    pm10: [20, 50],
    co2: [800, 1200],
  };

  if (!ranges[type]) return { label: "N/A", color: "text-gray-500", icon: null };

  const [good, moderate] = ranges[type];
  if (value < good) return { label: "Buena", color: "text-green-500", icon: <FaSmile /> };
  if (value < moderate) return { label: "Moderada", color: "text-yellow-500", icon: <FaMeh /> };
  return { label: "Mala", color: "text-red-500", icon: <FaFrown /> };
};

const Calidad = ({ estacion }: Props) => {
  const [data, setData] = useState<SensorData>({});
  const [previousData, setPreviousData] = useState<SensorData>({});
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<{ label: string; color: string; icon: JSX.Element | null }>({
    label: "", color: "", icon: null
  });

  const fetchData = useCallback(async () => {
    try {
      const requests = sensores.map(sensor =>
        axios.get(`https://api.helsy.com.co/api/previewDetailCharts/${estacion.id}/${sensor.code}`)
      );

      const responses = await Promise.all(requests);
      const values: SensorData = {};

      responses.forEach((res, index) => {
        const sensor = sensores[index];
        const json = res.data;
        if (Array.isArray(json) && json.length > 0) {
          const match = json[0].lectura.match(/([\d.]+)/);
          values[sensor.key] = match ? parseFloat(match[0]) : 0;
        } else {
          values[sensor.key] = 0;
        }
      });

      setPreviousData(data);
      setData(values);

      // Resumen general
      const qualityLevels = ["Buena", "Moderada", "Mala"];
      const scores = ["pm25", "pm10", "co2"].map(key => {
        const q = getAirQualityLabel(key, values[key]);
        return qualityLevels.indexOf(q.label);
      });

      const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      setSummary({
        label: qualityLevels[avgScore],
        color: avgScore === 0 ? "text-green-500" : avgScore === 1 ? "text-yellow-500" : "text-red-500",
        icon: avgScore === 0 ? <FaSmile size={30} /> : avgScore === 1 ? <FaMeh size={30} /> : <FaFrown size={30} />,
      });

    } catch (error) {
      console.error("Error al obtener datos de sensores:", error);
    } finally {
      setLoading(false);
    }
  }, [data, estacion.id]);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 60000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Estación: {estacion.nombre}
      </h2>

      {/* Resumen general */}
      <div className="flex items-center gap-3 mb-6 p-4 rounded-lg shadow-lg bg-white">
        {summary.icon}
        <span className={`font-semibold ${summary.color} text-lg`}>
          Calidad del aire: {summary.label}
        </span>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando datos...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {sensores.map(sensor => {
            const prevValue = previousData[sensor.key] ?? 0;
            const currentValue = data[sensor.key] ?? 0;
            const diff = currentValue - prevValue;
            const isPositive = diff > 0;
            const quality = getAirQualityLabel(sensor.key, currentValue);

            return (
              <div key={sensor.key} className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center">
                <div className="mb-2">{icons[sensor.key as keyof typeof icons]}</div>
                <h3 className="text-lg font-semibold">{sensor.title}</h3>
                <div className="text-2xl font-bold">
                  {currentValue.toFixed(2)} {sensor.unit}
                </div>
                {prevValue !== undefined && (
                  <div className={`flex items-center gap-1 ${isPositive ? "text-red-500" : "text-green-500"}`}>
                    {isPositive ? <FaArrowUp /> : <FaArrowDown />}
                    <span>{Math.abs(diff).toFixed(2)}</span>
                  </div>
                )}
                {quality.label !== "N/A" && (
                  <div className={`flex items-center gap-1 mt-2 ${quality.color}`}>
                    {quality.icon}
                    <span className="text-sm">{quality.label}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Calidad;

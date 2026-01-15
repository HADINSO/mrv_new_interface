// @ts-nocheck
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  FaSun, FaVolumeUp, FaTemperatureHigh, FaWater,
  FaArrowUp, FaArrowDown, FaSmile, FaMeh, FaFrown
} from "react-icons/fa";
import { GiChemicalDrop, GiDustCloud } from "react-icons/gi";
import { MdCo2 } from "react-icons/md";
import { useModal } from "../../hooks/useModal";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

/* ===================== TIPOS ===================== */
interface Estacion {
  id: number;
  nombre: string;
}

type Props = { estacion: Estacion };
type SensorData = Record<string, number>;

/* ===================== ICONOS ===================== */
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

/* ===================== SENSORES ===================== */
const sensores = [
  { key: "radiation", title: "Radiación Solar", code: "V4", unit: "W/m²" },
  { key: "noise", title: "Ruido Ambiental", code: "V6", unit: "dB" },
  { key: "co2", title: "CO₂", code: "V12", unit: "ppm" },
  { key: "hcho", title: "HCHO", code: "V11", unit: "mg/m³" },
  { key: "tvoc", title: "TVOC", code: "V15", unit: "mg/m³" },
  { key: "pm25", title: "PM2.5", code: "V1", unit: "µg/m³" },
  { key: "pm10", title: "PM10", code: "V10", unit: "µg/m³" },
  { key: "temp", title: "Temperatura", code: "V5", unit: "°C" },
  { key: "humidity", title: "Humedad", code: "V8", unit: "%" },
];

/* ===================== CALIDAD ===================== */
const getAirQualityLabel = (type: string, value: number) => {
  const ranges: Record<string, [number, number]> = {
    pm25: [12, 35],
    pm10: [20, 50],
    co2: [800, 1200],
  };

  if (!ranges[type]) return { label: "N/A", color: "text-gray-400", icon: null };

  const [good, moderate] = ranges[type];
  if (value < good) return { label: "Buena", color: "text-green-500", icon: <FaSmile /> };
  if (value < moderate) return { label: "Moderada", color: "text-yellow-500", icon: <FaMeh /> };
  return { label: "Mala", color: "text-red-500", icon: <FaFrown /> };
};

/* ===================== COMPONENTE ===================== */
const Calidad = ({ estacion }: Props) => {
  const { isOpen, openModal, closeModal } = useModal();

  const [data, setData] = useState<SensorData>({});
  const [previousData, setPreviousData] = useState<SensorData>({});
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedSensor, setSelectedSensor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ===================== FETCH ACTUAL ===================== */
  const fetchData = useCallback(async () => {
    try {
      const reqs = sensores.map(s =>
        axios.get(`https://api.helsy.com.co/api/previewDetailCharts/${estacion.id}/${s.code}`)
      );

      const res = await Promise.all(reqs);
      const values: SensorData = {};

      res.forEach((r, i) => {
        const m = r.data?.[0]?.lectura?.match(/([\d.]+)/);
        values[sensores[i].key] = m ? parseFloat(m[0]) : 0;
      });

      setPreviousData(data);
      setData(values);
    } finally {
      setLoading(false);
    }
  }, [data, estacion.id]);

  /* ===================== HISTÓRICO + ESTADÍSTICOS ===================== */
  const fetchSensorHistory = async (sensorCode: string) => {
    try {
      const res = await axios.get(
        `https://api.helsy.com.co/api/previewDetailCharts/${estacion.id}/${sensorCode}`
      );

      const formatted = res.data.map((i: any) => {
        const m = i.lectura?.match(/([\d.]+)/);
        return {
          fecha: i.fecha || i.created_at || "",
          valor: m ? parseFloat(m[0]) : 0
        };
      });

      setHistory(formatted);

      const valores = formatted.map(d => d.valor);
      const min = Math.min(...valores);
      const max = Math.max(...valores);
      const avg = valores.reduce((a, b) => a + b, 0) / valores.length;

      setStats({ min, max, avg });
    } catch {
      setHistory([]);
      setStats(null);
    }
  };

  useEffect(() => {
    fetchData();
    const i = setInterval(fetchData, 60000);
    return () => clearInterval(i);
  }, [fetchData]);

  /* ===================== RENDER ===================== */
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Estación: {estacion.nombre}</h2>

      {loading ? <p>Cargando…</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {sensores.map(sensor => {
            const current = data[sensor.key] ?? 0;
            const prev = previousData[sensor.key] ?? 0;
            const diff = current - prev;
            const quality = getAirQualityLabel(sensor.key, current);

            return (
              <div
                key={sensor.key}
                onClick={() => {
                  setSelectedSensor({ sensor, current, diff, quality });
                  fetchSensorHistory(sensor.code);
                  openModal();
                }}
                className="bg-white rounded-xl p-5 shadow-md cursor-pointer hover:scale-[1.02] transition"
              >
                {icons[sensor.key]}
                <h3 className="mt-2 font-semibold">{sensor.title}</h3>
                <div className="text-2xl font-bold">{current.toFixed(2)} {sensor.unit}</div>
                <div className={`flex gap-1 ${diff > 0 ? "text-red-500" : "text-green-500"}`}>
                  {diff > 0 ? <FaArrowUp /> : <FaArrowDown />} {Math.abs(diff).toFixed(2)}
                </div>
                {quality.icon && (
                  <div className={`flex gap-1 mt-2 ${quality.color}`}>
                    {quality.icon} <span>{quality.label}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ===================== MODAL ===================== */}
      {isOpen && selectedSensor && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white max-w-3xl w-full rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-bold">{selectedSensor.sensor.title}</h3>
              <button onClick={closeModal}>✕</button>
            </div>

            <div className="p-6 space-y-6">

              {/* Valor actual */}
              <div className="flex items-center gap-3">
                {icons[selectedSensor.sensor.key]}
                <span className="text-3xl font-bold">
                  {selectedSensor.current.toFixed(2)} {selectedSensor.sensor.unit}
                </span>
              </div>

              {/* Gráfico */}
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="valor" stroke="#2563eb" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* ===== TABLA ESTADÍSTICA ===== */}
              {stats && (
                <table className="w-full text-sm border rounded-lg overflow-hidden">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">Indicador</th>
                      <th className="p-2 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-green-50">
                      <td className="p-2">Mínimo</td>
                      <td className="p-2 text-right font-semibold text-green-600">
                        {stats.min.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="bg-yellow-50">
                      <td className="p-2">Promedio</td>
                      <td className="p-2 text-right font-semibold text-yellow-600">
                        {stats.avg.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="bg-red-50">
                      <td className="p-2">Máximo</td>
                      <td className="p-2 text-right font-semibold text-red-600">
                        {stats.max.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calidad;

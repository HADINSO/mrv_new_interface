import { JSX, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ApiHelsy from "../../service/ApiHelsy";
import {
  FaTemperatureHigh,
  FaWind,
  FaCloud,
  FaCompressAlt,
  FaSun,
  FaCloudRain,
  FaCloudShowersHeavy,
  FaGasPump,
  FaSmog,
  FaBurn,
  FaArrowUp,
  FaWater,
  FaTachometerAlt,
  FaRadiation,
  FaThermometerHalf,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

/* ===================== Interfaces ===================== */

interface Variable {
  id: number;
  nombre: string;
  codigo: string;
  estado: number; // 0 = ACTIVO | 1 = INACTIVO
}

interface Props {
  idEstacion: number;
}

interface Dato {
  lectura: string;
  hora: string;
  fecha: string;
}

/* ===================== Estados UI ===================== */

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center space-y-4 py-16">
    <div className="animate-spin h-8 w-8 rounded-full border-4 border-green-500 border-t-transparent" />
    <p className="text-lg text-gray-600">Cargando lista de variables...</p>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
    <p className="font-bold text-red-700">Error</p>
    <p className="text-sm text-red-600 mt-1">{message}</p>
  </div>
);

/* ===================== CardVariable ===================== */

const CardVariable = ({
  codigo,
  idEstacion,
  idVariable,
  nombre,
  estado: estadoInicial,
}: {
  codigo: string;
  idEstacion: number;
  idVariable: number;
  nombre: string;
  estado: number;
}) => {
  const [valor, setValor] = useState<Dato | null>(null);
  const [loading, setLoading] = useState(true);
  const [estado, setEstado] = useState<number>(estadoInicial);
  const [loadingToggle, setLoadingToggle] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const esAdmin = isAuthenticated && user?.idrol === 1;

  /* ======= Formato de lectura ======= */
  const formatearLectura = (lectura: string, codigo: string) => {
    const regex = new RegExp(`(\\d+(\\.\\d+)?)(?=${codigo})`);
    const match = lectura.match(regex);
    const valorStr = match ? match[1] : null;
    const num = valorStr ? parseFloat(valorStr) : NaN;

    if (isNaN(num)) return "Dato inválido";

    switch (codigo) {
      case "V5": return `${num.toFixed(1)} °C`;
      case "V8": return `${Math.round(num)}%`;
      case "V9":
        return valorStr && valorStr.length > 5
          ? `${(num / 100000).toFixed(5)} bar`
          : `0.${valorStr?.padStart(5, "0")} bar`;
      case "V3":
      case "V4": return `${num.toFixed(1)} km/h`;
      case "V6":
      case "V7": return `${num.toFixed(1)} mm`;
      case "V1":
      case "V2": return `${num.toFixed(2)} m`;
      case "V10": return `${num.toFixed(1)} W/m²`;
      case "V12":
      case "V13":
      case "V15":
      case "V16": return `${num.toFixed(3)} µg/m³`;
      default: return num.toString();
    }
  };

  /* ======= Iconos ======= */
  //@tg-ingore
  const iconMap: Record<string, JSX.Element> = {
    V1: <FaWater className="text-3xl text-blue-600" />,
    V2: <FaArrowUp className="text-3xl text-teal-500" />,
    V3: <FaWind className="text-3xl text-cyan-500" />,
    V4: <FaTachometerAlt className="text-3xl text-green-500" />,
    V5: <FaTemperatureHigh className="text-3xl text-red-500" />,
    V6: <FaCloudRain className="text-3xl text-blue-400" />,
    V7: <FaCloudShowersHeavy className="text-3xl text-blue-700" />,
    V8: <FaThermometerHalf className="text-3xl text-green-600" />,
    V9: <FaCompressAlt className="text-3xl text-purple-500" />,
    V10: <FaSun className="text-3xl text-yellow-500" />,
    V12: <FaGasPump className="text-3xl text-orange-600" />,
    V13: <FaSmog className="text-3xl text-gray-700" />,
    V15: <FaBurn className="text-3xl text-pink-500" />,
    V16: <FaRadiation className="text-3xl text-red-600" />,
  };

  /* ======= Toggle estado ======= */
  const toggleEstado = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loadingToggle) return;

    const nuevoEstado = estado === 0 ? 1 : 0;
    setLoadingToggle(true);

    try {
      await ApiHelsy.post(`toggle/variable/update/${idVariable}/${nuevoEstado}`);
      setEstado(nuevoEstado);
    } finally {
      setLoadingToggle(false);
    }
  };

  /* ======= Lecturas ======= */
  useEffect(() => {
    const fetchData = () => {
      ApiHelsy.get(`previewDetailCharts/${idEstacion}/${codigo}`)
        .then(res => {
          const data = res.data;
          if (Array.isArray(data) && data.length > 0) {
            const u = data[data.length - 1];
            setValor({
              lectura: u.lectura,
              hora: u.hora,
              fecha: u.fecha,
            });
          }
        })
        .finally(() => setLoading(false));
    };

    fetchData();
    const i = setInterval(fetchData, 30000);
    return () => clearInterval(i);
  }, [codigo, idEstacion]);

  return (
    <div
      className={`flex flex-col h-full p-5 rounded-2xl shadow-md border transition-all
        ${
          estado === 1
            ? "bg-gray-200 opacity-60"
            : "bg-white hover:shadow-xl hover:border-green-400"
        }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          {iconMap[codigo] || <FaCloud />}
          <h3 className="text-lg font-bold">{nombre}</h3>
        </div>

        {esAdmin && (
          <button onClick={toggleEstado}>
            {estado === 0 ? (
              <FaToggleOn className="text-2xl text-green-600" />
            ) : (
              <FaToggleOff className="text-2xl text-gray-500" />
            )}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex-grow flex items-center justify-center">...</div>
      ) : valor ? (
        <div className="flex-grow flex flex-col justify-end">
          <p
            className={`text-4xl font-extrabold mb-3 ${
              estado === 1 ? "text-gray-500" : "text-green-600"
            }`}
          >
            {formatearLectura(valor.lectura, codigo)}
          </p>
          <div className="text-sm text-gray-500 border-t pt-3">
            <p className="flex justify-between">
              <span>Última lectura:</span>
              <span>{valor.hora}</span>
            </p>
            <p className="text-xs text-right">{valor.fecha}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-red-500">No hay datos</p>
      )}
    </div>
  );
};

/* ===================== VariablesMrv ===================== */

const VariablesMrv = ({ idEstacion }: Props) => {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, user } = useAuth();
  const esAdmin = isAuthenticated && user?.idrol === 1;

  useEffect(() => {
    ApiHelsy.get(`estaciones/veriables/${idEstacion}`)
      .then(res => setVariables(res.data))
      .catch(() => setError("Error cargando variables"))
      .finally(() => setLoading(false));
  }, [idEstacion]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {variables
        .filter(v => v.estado === 0 || esAdmin)
        .sort((a, b) => a.estado - b.estado)
        .map(v => (
          <Link
            key={v.id}
            to={`/monitoring/variables/detalles/${v.codigo}/${idEstacion}`}
          >
            <CardVariable
              {...v}
              idVariable={v.id}
              idEstacion={idEstacion}
            />
          </Link>
        ))}
    </div>
  );
};

export default VariablesMrv;

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ApiHelsy from "../../service/ApiHelsy";
import {
  FaTemperatureHigh, FaWind, FaCloud, FaCompressAlt,
  FaSun, FaCloudRain, FaCloudShowersHeavy, FaGasPump, FaSmog,
  FaBurn, FaArrowUp, FaWater, FaTachometerAlt, FaRadiation,
  FaThermometerHalf
} from "react-icons/fa";

// --- Interfaces ---

interface Variable {
  id: number;
  nombre: string;
  codigo: string;
}

interface Props {
  idEstacion: number;
}

interface Dato {
  lectura: string;
  hora: string;
  fecha: string;
}

// --- Componentes de Estado ---

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center space-y-4 py-16">
    <svg
      className="animate-spin h-8 w-8 text-green-600 dark:text-green-400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
           5.291A7.962 7.962 0 014 12H0c0 3.042 
           1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
      Cargando lista de variables...
    </p>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-md">
    <p className="font-bold text-red-700 dark:text-red-300">Error:</p>
    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{message}</p>
  </div>
);

// --- CardVariable Componente ---

const CardVariable = ({
  codigo,
  idEstacion,
  nombre,
}: {
  codigo: string;
  idEstacion: number;
  nombre: string;
}) => {
  const [valor, setValor] = useState<Dato | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const formatearLectura = (lectura: string, codigo: string) => {
    const regex = new RegExp(`(\\d+(\\.\\d+)?)(?=${codigo})`);
    const match = lectura.match(regex);
    const valorStr = match ? match[1] : null;
    const num = valorStr ? parseFloat(valorStr) : NaN;

    if (isNaN(num)) return "Dato inválido";

    switch (codigo) {
      case "V5":
        return `${num.toFixed(1)} °C`;
      case "V8":
        return `${Math.round(num)}%`;
      case "V9":
        if (valorStr && valorStr.length > 5) {
          return `${(num / 100000).toFixed(5)} bar`;
        } else if (valorStr) {
          return `0.${valorStr.padStart(5, "0")} bar`;
        } else return "Dato inválido";
      case "V3":
      case "V4":
        return `${num.toFixed(1)} km/h`;
      case "V6":
      case "V7":
        return `${num.toFixed(1)} mm`;
      case "V2":
      case "V1":
        return `${num.toFixed(2)} m`;
      case "V10":
        return `${num.toFixed(1)} W/m²`;
      case "V13":
      case "V12":
      case "V15":
      case "V16":
        return `${num.toFixed(3)} µg/m³`;
      default:
        return num.toString();
    }
  };

  // Iconos por código
  const iconMap: { [key: string]: React.ReactNode } = {
    V1: <FaWater className="text-3xl text-blue-600 dark:text-blue-400" />,
    V2: <FaArrowUp className="text-3xl text-teal-500 dark:text-teal-400" />,
    V3: <FaWind className="text-3xl text-cyan-500 dark:text-cyan-400" />,
    V4: <FaTachometerAlt className="text-3xl text-green-500 dark:text-green-400" />,
    V5: <FaTemperatureHigh className="text-3xl text-red-500 dark:text-red-400" />,
    V6: <FaCloudRain className="text-3xl text-blue-400 dark:text-blue-300" />,
    V7: <FaCloudShowersHeavy className="text-3xl text-blue-700 dark:text-blue-500" />,
    V8: <FaThermometerHalf className="text-3xl text-green-600 dark:text-green-400" />,
    V9: <FaCompressAlt className="text-3xl text-purple-500 dark:text-purple-400" />,
    V10: <FaSun className="text-3xl text-yellow-500 dark:text-yellow-400" />,
    V12: <FaGasPump className="text-3xl text-orange-600 dark:text-orange-400" />,
    V13: <FaSmog className="text-3xl text-gray-700 dark:text-gray-300" />,
    V15: <FaBurn className="text-3xl text-pink-500 dark:text-pink-400" />,
    V16: <FaRadiation className="text-3xl text-red-600 dark:text-red-500" />,
    default: <FaCloud className="text-3xl text-gray-400 dark:text-gray-500" />,
  };

  const icon = iconMap[codigo] || iconMap.default;

  useEffect(() => {
    const fetchData = () => {
      ApiHelsy.get(`previewDetailCharts/${idEstacion}/${codigo}`)
        .then((res) => {
          const data = res.data;
          if (Array.isArray(data) && data.length > 0) {
            const ultimo = data[data.length - 1];
            setValor({
              lectura: ultimo.lectura,
              hora: ultimo.hora,
              fecha: ultimo.fecha,
            });
          } else setValor(null);
        })
        .catch((err) => {
          console.error(`Error al obtener datos de ${codigo}`, err);
          setValor(null);
        })
        .finally(() => setLoading(false));
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [codigo, idEstacion]);

  return (
    <div
      className="flex flex-col h-full p-5 rounded-2xl shadow-md bg-white dark:bg-gray-800 
                 border border-gray-100 dark:border-gray-700 hover:shadow-xl 
                 hover:border-green-400 dark:hover:border-green-600 transition-all duration-300 
                 transform hover:-translate-y-1 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          {icon}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
            {nombre}
          </h3>
        </div>
        <span className="text-xs font-mono font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded-full">
          {codigo}
        </span>
      </div>

      {loading ? (
        <div className="flex-grow flex items-center justify-center py-6">
          <div className="h-5 w-5 animate-pulse rounded-full bg-gray-300 dark:bg-gray-600"></div>
        </div>
      ) : valor ? (
        <div className="flex-grow flex flex-col justify-end">
          <p className="text-4xl font-extrabold text-green-600 dark:text-green-400 break-words mb-3">
            {formatearLectura(valor.lectura, codigo)}
          </p>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 border-t border-dashed border-gray-200 dark:border-gray-700 pt-3">
            <p className="flex justify-between">
              <span>Última lectura:</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{valor.hora}</span>
            </p>
            <p className="text-xs text-right mt-0.5">{valor.fecha}</p>
          </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center py-6">
          <p className="text-sm text-red-500 dark:text-red-400 font-medium">
            No hay datos disponibles.
          </p>
        </div>
      )}
    </div>
  );
};

// --- VariablesMrv Principal ---

const VariablesMrv = ({ idEstacion }: Props) => {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idEstacion) {
      setError("ID de estación no proporcionado");
      setLoading(false);
      return;
    }

    const fetchVariables = () => {
      ApiHelsy.get(`estaciones/veriables/${idEstacion}`)
        .then((response) => {
          const data = response.data;
          if (Array.isArray(data) && data.length > 0) {
            setVariables(data);
          } else {
            setError("No se encontraron variables asociadas a esta estación.");
          }
        })
        .catch((err) => {
          console.error("Error al cargar las variables:", err);
          setError("No se pudo cargar la lista de variables. Verifique la API.");
        })
        .finally(() => setLoading(false));
    };

    fetchVariables();
  }, [idEstacion]);

  const Cards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {variables.map((variable) => (
        <Link
          key={variable.id}
          to={`/monitoring/variables/detalles/${variable.codigo}/${idEstacion}`}
          className="block"
        >
          <CardVariable
            codigo={variable.codigo}
            idEstacion={idEstacion}
            nombre={variable.nombre}
          />
        </Link>
      ))}
    </div>
  );

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorState message={error} />
      ) : variables.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-10">
          No hay variables registradas para esta estación.
        </p>
      ) : (
        <Cards />
      )}
    </>
  );
};

export default VariablesMrv;

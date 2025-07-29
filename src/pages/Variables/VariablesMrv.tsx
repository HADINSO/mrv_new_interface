import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom"; // corregido: react-router → react-router-dom
import PageMeta from "../../components/common/PageMeta";
import ApiHelsy from "../../service/ApiHelsy";
import {
    FaTemperatureHigh, FaWind, FaCloud, FaCompressAlt,
    FaSun, FaCloudRain, FaCloudShowersHeavy, FaGasPump, FaSmog,
    FaBurn, FaArrowUp, FaWater, FaTachometerAlt, FaRadiation,
    FaThermometerHalf
} from "react-icons/fa";

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

const CardVariable = ({ codigo, idEstacion, nombre }: { codigo: string; idEstacion: number; nombre: string }) => {
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
                    return `0.${valorStr.padStart(5, '0')} bar`;
                } else {
                    return "Dato inválido";
                }
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
                    }
                })
                .catch((err) => {
                    console.error(`Error al obtener datos de ${codigo}`, err);
                })
                .finally(() => {
                    setLoading(false);
                });
        };

        fetchData(); // Llamada inicial

        const interval = setInterval(fetchData, 30000); // Cada 30 segundos

        return () => clearInterval(interval); // Limpieza al desmontar
    }, [codigo, idEstacion]);

    const iconMap: { [key: string]: React.ReactNode } = {
        V1: <FaWater className="text-3xl text-blue-600" />,
        V2: <FaArrowUp className="text-3xl text-teal-500" />,
        V3: <FaWind className="text-3xl text-cyan-500" />,
        V4: <FaTachometerAlt className="text-3xl text-indigo-500" />,
        V5: <FaTemperatureHigh className="text-3xl text-red-500" />,
        V6: <FaCloudRain className="text-3xl text-blue-400" />,
        V7: <FaCloudShowersHeavy className="text-3xl text-blue-700" />,
        V8: <FaThermometerHalf className="text-3xl text-green-500" />,
        V9: <FaCompressAlt className="text-3xl text-purple-500" />,
        V10: <FaSun className="text-3xl text-yellow-500" />,
        V12: <FaGasPump className="text-3xl text-orange-600" />,
        V13: <FaSmog className="text-3xl text-gray-700" />,
        V15: <FaBurn className="text-3xl text-pink-500" />,
        V16: <FaRadiation className="text-3xl text-red-600" />,
        default: <FaCloud className="text-3xl text-gray-400" />,
    };

    const icon = iconMap[codigo] || iconMap.default;

    return (
        <div className="p-4 rounded-lg shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
                {icon}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{nombre}</h3>
                    {loading ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Cargando...</p>
                    ) : valor ? (
                        <>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Lectura:</span> {formatearLectura(valor.lectura, codigo)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Hora:</span> {valor.hora}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{valor.fecha}</p>
                        </>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No hay datos.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const VariablesMrv = ({ idEstacion }: Props) => {
    const { id } = useParams<{ id: string }>();
    const [variables, setVariables] = useState<Variable[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError("ID de estación no proporcionado");
            setLoading(false);
            return;
        }

        ApiHelsy.get(`estaciones/veriables/${idEstacion}`)
            .then((response) => {
                const data = response.data;
                if (Array.isArray(data) && data.length > 0) {
                    setVariables(data);
                } else {
                    setError("No se encontraron variables.");
                }
            })
            .catch((err) => {
                console.error(err);
                setError("No se pudo cargar las variables.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id, idEstacion]);

    const Cards = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {variables.map((variable) => (
                <Link
                    key={variable.id}
                    to={`/monitoring/variables/detalles/${variable.codigo}/${idEstacion}`}
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
            <PageMeta title="Monitoreo" description="Monitoreo de la estación." />
            <div className="p-6 rounded-2xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
                {loading ? (
                    <p className="text-gray-600 dark:text-gray-300">Cargando variables...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : (
                    <Cards />
                )}
            </div>
        </>
    );
};

export default VariablesMrv;

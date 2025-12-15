import { useEffect, useState } from "react";
import ApiHelsy from "../../service/ApiHelsy";
import { useNavigate, useParams } from "react-router";
import EnvironmentalChart from "./EnvironmentalChart";
import EnvironmentalPolarChart from "./EnvironmentalPolarChart";
import InformeLecturas from "./InformeLecturas";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Helper from "../../service/Helper";

interface Lectura {
    id: number;
    lectura: string;
    hora: string;
    fecha: string;
    codigo?: string;
}

const VARIABLES_MAP: Record<string, string> = {
    V1: "Flujo",
    V2: "Dirección del Viento °",
    V3: "Velocidad del viento en 1 minuto km/h",
    V4: "Velocidad del viento en 5 minutos km/h",
    V5: "Temperatura",
    V6: "Lluvia en 1 hora (mm)",
    V7: "Lluvia en las últimas 24 horas (mm)",
    V8: "Humedad Relativa % RH",
    V9: "Presión Barométrica (1 atmósfera = 1.01325 bar.)",
    V10: "Nivel",
    V12: "Monóxido de carbono μg/m³",
    V13: "Amoníaco NH3 μg/m³",
    V15: "Dióxido de nitrógeno μg/m³",
    V16: "Óxidos de Nitrógeno (NOx) μg/m³",
};

const Detalles: React.FC = () => {
    const { codigo, id } = useParams<{ codigo: string; id: string }>();
    const [datos, setDatos] = useState<Lectura[]>([]);
    const [prompt, setPrompt] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [loadingDownload, setLoadingDownload] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const ruta_actual = location.pathname;
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            const rutaCodificada = encodeURIComponent(ruta_actual);
            navigate(`/signin/${rutaCodificada}`);
        }
    }, [isAuthenticated, navigate, ruta_actual]);

    useEffect(() => {
        if (!codigo || !id) return;

        const fetchData = async () => {
            try {
                const res = await ApiHelsy.get(
                    `PreviewDetailChartsAdvanced/${id}/${codigo}`
                );

                const data: unknown = res.data;

                if (Array.isArray(data)) {
                    const datosConCodigo: Lectura[] = data.map((item: any) => ({
                        ...item,
                        codigo,
                    }));
                    setDatos(datosConCodigo);
                    generarPrompt(datosConCodigo);
                } else {
                    setDatos([]);
                }
            } catch (error) {
                console.error("Error al cargar datos", error);
                setDatos([]);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [codigo, id]);

    const generarPrompt = (datos: Lectura[]) => {
        const valoresPorFecha: Record<string, string[]> = {};

        datos.forEach((lectura) => {
            const fecha = lectura.fecha;
            const variableNombre =
                VARIABLES_MAP[lectura.codigo || ""] ||
                lectura.codigo ||
                "Desconocida";

            const valorLimpio = lectura.lectura
                .replace(/V\d*$/i, "")
                .trim();

            const texto = `${variableNombre}: ${valorLimpio}-`;

            if (!valoresPorFecha[fecha]) {
                valoresPorFecha[fecha] = [];
            }
            valoresPorFecha[fecha].push(texto);
        });

        let textoFinal = `
            Realiza un análisis estadístico completo del dataset.
            La respuesta debe ser exclusivamente en HTML.

            Datos procesados:
        `;

        Object.entries(valoresPorFecha).forEach(([fecha, valores]) => {
            textoFinal += `\nFecha: ${fecha}\n${valores.join("\n")}\n`;
        });

        setPrompt(textoFinal.trim());
    };

    const handleDownloadCSV = async () => {
        if (!fechaInicio || !fechaFin || !id || !codigo) {
            alert("Seleccione ambas fechas");
            return;
        }

        try {
            setLoadingDownload(true);

            const url = `${Helper.url}download/variable/${id}/${codigo}/${fechaInicio}/${fechaFin}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
            });

            if (!response.ok) {
                throw new Error("Error al obtener datos");
            }

            const data: {
                id: number;
                lectura: string;
                fecha_hora: string;
            }[] = await response.json();

            /* ================= CSV ================= */
            let csvContent = "id,fecha,dato\n";

            data.forEach((item) => {
                const row = [
                    item.id,
                    item.fecha_hora,
                    item.lectura
                ]
                    .map(value => `"${value}"`)
                    .join(",");

                csvContent += row + "\n";
            });

            /* =============== DOWNLOAD =============== */
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const downloadUrl = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `variable_${codigo}_${fechaInicio}_${fechaFin}.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            URL.revokeObjectURL(downloadUrl);
            setShowModal(false);
        } catch (error) {
            console.error(error);
            alert("No se pudo generar el CSV");
        } finally {
            setLoadingDownload(false);
        }
    };


    return (
        <div className="p-6 rounded-2xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                    Descargar CSV por fecha
                </button>
            </div>

            <div className="overflow-x-auto">
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 space-y-6 xl:col-span-7">
                        <EnvironmentalChart data={datos} code={codigo || ""} />
                    </div>
                    <div className="col-span-12 xl:col-span-5">
                        <EnvironmentalPolarChart
                            data={datos}
                            code={codigo || ""}
                        />
                    </div>
                    <div className="col-span-12">
                        <InformeLecturas prompt={prompt} />
                    </div>
                </div>
            </div>

            {showModal && (
                <div
                    className="
      fixed inset-0 z-50 flex items-center justify-center
      bg-black/70 backdrop-blur-sm transition-opacity
    "
                    onClick={() => setShowModal(false)}
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="
        w-full max-w-md mx-4
        bg-white dark:bg-gray-900
        rounded-2xl shadow-2xl
        p-8 space-y-8
        border border-gray-100 dark:border-gray-800
      "
                    >
                        {/* Header */}
                        <div className="text-center space-y-2">
                            <div
                                className="
            mx-auto w-14 h-14 rounded-full
            bg-gradient-to-br from-green-500 to-blue-600
            flex items-center justify-center
            text-white text-xl font-bold shadow-lg
          "
                            >
                                📊
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Descargar reporte
                            </h2>

                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Selecciona el rango de fechas para generar el CSV
                            </p>
                        </div>

                        {/* Calendarios */}
                        <div className="grid grid-cols-1 gap-6">
                            {/* Fecha inicio */}
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Fecha de inicio
                                </label>

                                <DatePicker
                                    selected={fechaInicio ? new Date(fechaInicio) : null}
                                      //@ts-ignore
                                    onChange={(date: Date) =>
                                        setFechaInicio(date.toISOString().split("T")[0])
                                    }
                                    maxDate={fechaFin ? new Date(fechaFin) : undefined}
                                    placeholderText="Selecciona una fecha"
                                    className="
              w-full px-4 py-3 rounded-xl
              border border-gray-200
              focus:ring-2 focus:ring-green-500 focus:border-green-500
              dark:bg-gray-800 dark:border-gray-700 dark:text-white
              transition shadow-sm
            "
                                    calendarClassName="rounded-xl shadow-lg border"
                                />
                            </div>

                            {/* Fecha fin */}
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Fecha de fin
                                </label>

                                <DatePicker
                                    selected={fechaFin ? new Date(fechaFin) : null}
                                    //@ts-ignore
                                    onChange={(date: Date) =>
                                        setFechaFin(date.toISOString().split("T")[0])
                                    }
                                    minDate={fechaInicio ? new Date(fechaInicio) : undefined}
                                    placeholderText="Selecciona una fecha"
                                    className="
              w-full px-4 py-3 rounded-xl
              border border-gray-200
              focus:ring-2 focus:ring-green-500 focus:border-green-500
              dark:bg-gray-800 dark:border-gray-700 dark:text-white
              transition shadow-sm
            "
                                    calendarClassName="rounded-xl shadow-lg border"
                                />
                            </div>

                            <p className="text-xs text-center text-gray-400">
                                El archivo se descargará en formato <span className="font-semibold text-green-600">CSV</span>
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="
            flex-1 py-3 rounded-xl font-semibold
            bg-gray-100 text-gray-700
            hover:bg-yellow-100 hover:text-yellow-700
            dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700
            transition
          "
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={handleDownloadCSV}
                                disabled={
                                    loadingDownload ||
                                    !fechaInicio ||
                                    !fechaFin ||
                                    fechaFin < fechaInicio
                                }
                                className={`
            flex-1 py-3 rounded-xl font-semibold text-white
            shadow-lg transition-all duration-300
            ${loadingDownload ||
                                        !fechaInicio ||
                                        !fechaFin ||
                                        fechaFin < fechaInicio
                                        ? "bg-green-400 opacity-60 cursor-not-allowed"
                                        : "bg-gradient-to-r from-green-600 via-green-500 to-blue-600 hover:from-green-700 hover:to-blue-700"
                                    }
          `}
                            >
                                {loadingDownload ? "Descargando..." : "Descargar CSV"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Detalles;

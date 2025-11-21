import { useEffect, useState } from "react";
import ApiHelsy from "../../service/ApiHelsy";
import { useNavigate, useParams } from "react-router";
import EnvironmentalChart from "./EnvironmentalChart";
import EnvironmentalPolarChart from "./EnvironmentalPolarChart";
import InformeLecturas from "./InformeLecturas";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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
    V12: "Monóxido de carbono / óxido de carbono μg/m³",
    V13: "Amoníaco NH3 μg/m³",
    V15: "Dióxido de nitrógeno u óxido de nitrógeno μg/m³",
    V16: "Óxidos de Nitrógeno (NOx) μg/m³",
};

const Detalles: React.FC = () => {
    const { codigo, id } = useParams<{ codigo: string; id: string }>();
    const [datos, setDatos] = useState<Lectura[]>([]);
    const [prompt, setPrompt] = useState<string>("");

    const navigate = useNavigate();
    const location = useLocation();
    const ruta_actual = location.pathname;
    const { isAuthenticated } = useAuth();
    // Redirección si no está autenticado
    useEffect(() => {
        if (!isAuthenticated) {
            const rutaCodificada = encodeURIComponent(ruta_actual);
            navigate(`/signin/${rutaCodificada}`);
        }
    }, [isAuthenticated, navigate, ruta_actual]);

    // Carga de datos
    useEffect(() => {
        if (!codigo || !id) return;

        const fetchData = async () => {
            try {
                const res = await ApiHelsy.get(`PreviewDetailChartsAdvanced/${id}/${codigo}`);
                const data: unknown = res.data;

                if (Array.isArray(data) && data.length > 0) {
                    const datosConCodigo: Lectura[] = data.map((item: any) => ({
                        ...item,
                        codigo,
                    }));
                    setDatos(datosConCodigo);
                    generarPrompt(datosConCodigo);
                } else {
                    setDatos([]);
                }
            } catch (err) {
                console.error(`Error al obtener datos de ${codigo}`, err);
                setDatos([]);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [codigo, id]);

    // Generación del prompt
    // Generación del prompt mejorado
    const generarPrompt = (datos: Lectura[]) => {
        const valoresPorFecha: Record<string, string[]> = {};

        datos.forEach((lectura) => {
            const fecha = lectura.fecha;

            // Nombre de la variable desde el mapa
            const variableNombre =
                VARIABLES_MAP[lectura.codigo || ""] ||
                lectura.codigo ||
                "Desconocida";

            // Limpieza del valor: eliminar sufijos tipo "V", "V1", "V2", etc.
            const valorLimpio = lectura.lectura.replace(/V\d*$/i, "").trim();

            const texto = `${variableNombre}: ${valorLimpio}-`;

            if (!valoresPorFecha[fecha]) {
                valoresPorFecha[fecha] = [];
            }
            valoresPorFecha[fecha].push(texto);
        });

        // Prompt final optimizado
        let textoFinal = `
            Realiza un análisis estadístico completo del dataset. 
            La respuesta debe ser exclusivamente en HTML, usando estructura clara (div, table, ul, etc.).

            Instrucciones estrictas:
            - Limpia todos los valores numéricos eliminando sufijos como "V", "V1", "V2". El valor final debe verse como "35.5-".
            - No menciones en ningún momento que existían sufijos.
            - Presenta los resultados en secciones HTML bien organizadas para crear tablas.
            - Incluye los siguientes análisis:
            • Resumen general del dataset
            • tabla: Total de registros
            • tabla: Total de columnas
            • tabla: Tipos de variables
            • tabla: Valores faltantes
            • tabla: Medidas de tendencia central (media, mediana, moda)
            • tabla: Medidas de dispersión (rango, varianza, desviación estándar, coeficiente de variación, IQR)
            • tabla: Medidas de forma (asimetría y curtosis)
            • tabla: Tablas de frecuencia
            • tabla: Correlaciones (Pearson o Spearman según corresponda)

            Datos procesados:
            `;

        // Agregar datos por fecha
        Object.entries(valoresPorFecha).forEach(([fecha, valores]) => {
            textoFinal += `\nFecha: ${fecha}\n${valores.join("\n")}\n`;
        });

        setPrompt(textoFinal.trim());
    };


    return (
        <div className="p-6 rounded-2xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
            <div className="overflow-x-auto">
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 space-y-6 xl:col-span-7">
                        <EnvironmentalChart data={datos} code={codigo || ""} />
                    </div>
                    <div className="col-span-12 xl:col-span-5">
                        <EnvironmentalPolarChart data={datos} code={codigo || ""} />
                    </div>
                    <div className="col-span-12">
                        <InformeLecturas prompt={prompt} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Detalles;

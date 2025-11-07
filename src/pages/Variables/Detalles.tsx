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
    const generarPrompt = (datos: Lectura[]) => {
        const valoresPorFecha: Record<string, string[]> = {};

        datos.forEach((lectura) => {
            const fecha = lectura.fecha;
            const variableNombre =
                VARIABLES_MAP[lectura.codigo || ""] || lectura.codigo || "Desconocida";
            const texto = `${variableNombre}: ${lectura.lectura}`;

            if (!valoresPorFecha[fecha]) {
                valoresPorFecha[fecha] = [];
            }
            valoresPorFecha[fecha].push(texto);
        });

        let textoFinal = `Descripción general del dataset:\n\n
- Número total de registros (observaciones)\n
- Número total de columnas\n
- Tipo de cada variable: cuantitativa (continua o discreta), cualitativa (nominal u ordinal)\n
- Conteo de valores faltantes por variable\n
- Medidas de tendencia central: media, mediana, moda\n
- Medidas de dispersión: rango, varianza, desviación estándar, coeficiente de variación, rango intercuartílico (IQR)\n
- Medidas de forma: asimetría (skewness), curtosis (kurtosis)\n
- Tablas de frecuencia: absoluta, relativa, acumulada\n
- Visualizaciones sugeridas: histogramas, boxplots, gráficos de barras/pastel, diagramas de dispersión\n
- Identificación de valores atípicos (boxplots, regla de 1.5 × IQR)\n
- Análisis de correlación (Pearson/Spearman según el caso)\n\n`;

        Object.entries(valoresPorFecha).forEach(([fecha, valores]) => {
            textoFinal += `Fecha: ${fecha}\n`;
            textoFinal += valores.join("\n") + "\n\n";
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

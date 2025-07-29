import { useEffect, useState } from "react";
import ApiHelsy from "../../service/ApiHelsy";
import { useParams } from "react-router";
import EnvironmentalChart from "./EnvironmentalChart";
import EnvironmentalPolarChart from "./EnvironmentalPolarChart";
import InformeLecturas from "./InformeLecturas";

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

const Detalles = () => {
    const { codigo, id } = useParams<{ codigo: string; id: string }>();
    const [datos, setDatos] = useState<Lectura[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [prompt, setPrompt] = useState<string>("");

    useEffect(() => {
        if (!codigo || !id) return;

        const fetchData = () => {
            setLoading(true);
            ApiHelsy.get(`PreviewDetailChartsAdvanced/${id}/${codigo}`)
                .then((res) => {
                    const data = res.data;
                    if (Array.isArray(data) && data.length > 0) {
                        const datosConCodigo = data.map((item: any) => ({
                            ...item,
                            codigo: codigo,
                        }));
                        setDatos(datosConCodigo);
                        generarPrompt(datosConCodigo);
                    } else {
                        setDatos([]);
                    }
                })
                .catch((err) => {
                    console.error(`Error al obtener datos de ${codigo}`, err);
                    setDatos([]);
                })
                .finally(() => {
                    setLoading(false);
                });
        };

        fetchData(); // Llamada inicial

        const interval = setInterval(fetchData, 30000); // Actualiza cada 30 segundos

        return () => clearInterval(interval); // Limpia al desmontar el componente
    }, [codigo, id]);

    const generarPrompt = (datos: Lectura[]) => {
        const valoresPorFecha: Record<string, string[]> = {};

        datos.forEach((lectura) => {
            const fecha = lectura.fecha;
            const variableNombre = VARIABLES_MAP[lectura.codigo || ""] || lectura.codigo || "Desconocida";
            const texto = `${variableNombre}: ${lectura.lectura}`;

            if (!valoresPorFecha[fecha]) {
                valoresPorFecha[fecha] = [];
            }
            valoresPorFecha[fecha].push(texto);
        });

        let textoFinal = `Descripción general del dataset:

            Número total de registros (observaciones)

            Número total de columnas 

            Tipo de cada variable: cuantitativa (continua o discreta), cualitativa (nominal u ordinal)

            Conteo de valores faltantes por variable

            Medidas de tendencia central :

            Media

            Mediana

            Moda

            Medidas de dispersión :

            Rango

            Varianza

            Desviación estándar

            Coeficiente de variación

            Rango intercuartílico (IQR)

            Medidas de forma:

            Asimetría (skewness)

            Curtosis (kurtosis)

            Tablas de frecuencia :

            Frecuencia absoluta

            Frecuencia relativa

            Frecuencia acumulada

            Visualizaciones sugeridas (describir, no generar):

            Histogramas para variables numéricas

            Boxplots para análisis de dispersión y outliers

            Gráficos de barras y de pastel para variables categóricas

            Diagramas de dispersión (scatter plots) si hay variables numéricas relacionadas

            Identificación de valores atípicos:

            Método visual: análisis mediante boxplots

            Método estadístico: utilizando la regla de 1.5 × IQR

            Análisis de correlación (si hay más de una variable numérica):

            Matriz de correlación de Pearson (si los datos son normales)

            Matriz de Spearman (si los datos no son normales)`;
        Object.entries(valoresPorFecha).forEach(([fecha, valores]) => {
            textoFinal += `Fecha: ${fecha}\n`;
            textoFinal += valores.join("\n") + "\n\n";
        });

        setPrompt(textoFinal.trim());
    };

    return (
        <div className="p-6 rounded-2xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
            <div className="overflow-x-auto">
                {loading ? (
                    <p className="text-center text-gray-700 dark:text-gray-300">Cargando datos...</p>
                ) : (
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
                )}
            </div>
        </div>
    );
};

export default Detalles;

import React, { useMemo } from "react";
import { motion } from "framer-motion";

/* ============================
   Tipos
============================ */

interface DatosPorFecha {
  fecha: string;
  valores: number[];
}

interface Props {
  datosTabla: DatosPorFecha[];
}

/* ============================
   Funciones estadísticas
============================ */

const promedio = (v: number[]) =>
  v.reduce((a, b) => a + b, 0) / v.length;

const varianza = (v: number[]) => {
  const p = promedio(v);
  return promedio(v.map(x => (x - p) ** 2));
};

const desviacion = (v: number[]) =>
  Math.sqrt(varianza(v));

const mediana = (v: number[]) => {
  const s = [...v].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const moda = (v: number[]) => {
  const freq: Record<number, number> = {};
  v.forEach(x => (freq[x] = (freq[x] || 0) + 1));
  return Number(
    Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]
  );
};

const rango = (v: number[]) =>
  Math.max(...v) - Math.min(...v);

const coefVariacion = (v: number[]) =>
  desviacion(v) / promedio(v);

const percentil = (v: number[], p: number) => {
  const s = [...v].sort((a, b) => a - b);
  const i = (p / 100) * (s.length - 1);
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  return s[lo] + (s[hi] - s[lo]) * (i - lo);
};

const asimetria = (v: number[]) => {
  const p = promedio(v);
  const sd = desviacion(v);
  return promedio(v.map(x => ((x - p) / sd) ** 3));
};

const curtosis = (v: number[]) => {
  const p = promedio(v);
  const sd = desviacion(v);
  return promedio(v.map(x => ((x - p) / sd) ** 4)) - 3;
};

const errorEstandar = (v: number[]) =>
  desviacion(v) / Math.sqrt(v.length);

/* ============================
   Regresión lineal (predicción)
============================ */

const regresionLineal = (v: number[]) => {
  const n = v.length;
  const x = Array.from({ length: n }, (_, i) => i + 1);

  const xMean = promedio(x);
  const yMean = promedio(v);

  const num = x.reduce(
    (sum, xi, i) => sum + (xi - xMean) * (v[i] - yMean),
    0
  );

  const den = x.reduce(
    (sum, xi) => sum + (xi - xMean) ** 2,
    0
  );

  const pendiente = num / den;
  const intercepto = yMean - pendiente * xMean;
  const prediccion = pendiente * (n + 1) + intercepto;

  return { pendiente, prediccion };
};

/* ============================
   Componente principal
============================ */

const TablaEstadisticaLecturas: React.FC<Props> = ({ datosTabla }) => {
  const filas = useMemo(() => {
    return datosTabla
      .map(({ fecha, valores }) => {
        if (!valores.length) return null;

        const { pendiente, prediccion } = regresionLineal(valores);

        return {
          fecha,
          n: valores.length,
          min: Math.min(...valores),
          max: Math.max(...valores),
          rango: rango(valores),
          promedio: promedio(valores),
          desviacion: desviacion(valores),
          cv: coefVariacion(valores),
          varianza: varianza(valores),
          mediana: mediana(valores),
          p25: percentil(valores, 25),
          p75: percentil(valores, 75),
          moda: moda(valores),
          asimetria: asimetria(valores),
          curtosis: curtosis(valores),
          error: errorEstandar(valores),
          tendencia: pendiente,
          prediccion,
        };
      })
      .filter(Boolean);
  }, [datosTabla]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg"
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Tabla Estadística y Tendencial de Lecturas
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="bg-blue-50 dark:bg-gray-800">
            <tr>
              {[
                "Fecha","n","Min","Max","Rango","Prom",
                "Desv","CV","Var","Med",
                "P25","P75","Moda",
                "Asim","Curt","EE",
                "Pend","Pred"
              ].map(h => (
                <th
                  key={h}
                  className="px-2 py-2 text-left border-b font-semibold"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filas.map((f: any) => (
              <tr
                key={f.fecha}
                className="hover:bg-blue-50/40 dark:hover:bg-gray-800/60"
              >
                <td className="px-2 py-1">{f.fecha}</td>
                <td className="px-2 py-1">{f.n}</td>
                <td className="px-2 py-1 text-blue-600">{f.min.toFixed(2)}</td>
                <td className="px-2 py-1 text-red-600">{f.max.toFixed(2)}</td>
                <td className="px-2 py-1">{f.rango.toFixed(2)}</td>
                <td className="px-2 py-1">{f.promedio.toFixed(2)}</td>
                <td className="px-2 py-1">{f.desviacion.toFixed(2)}</td>
                <td className="px-2 py-1">{f.cv.toFixed(2)}</td>
                <td className="px-2 py-1">{f.varianza.toFixed(2)}</td>
                <td className="px-2 py-1">{f.mediana.toFixed(2)}</td>
                <td className="px-2 py-1">{f.p25.toFixed(2)}</td>
                <td className="px-2 py-1">{f.p75.toFixed(2)}</td>
                <td className="px-2 py-1">{f.moda.toFixed(2)}</td>
                <td className="px-2 py-1">{f.asimetria.toFixed(2)}</td>
                <td className="px-2 py-1">{f.curtosis.toFixed(2)}</td>
                <td className="px-2 py-1">{f.error.toFixed(2)}</td>
                <td className="px-2 py-1">{f.tendencia.toFixed(3)}</td>
                <td className="px-2 py-1 font-semibold">
                  {f.prediccion.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-gray-500 italic">
        Predicción basada en regresión lineal simple. Interpretar con cautela
        ante estacionalidad o rupturas de serie.
      </p>
    </motion.div>
  );
};

export default TablaEstadisticaLecturas;

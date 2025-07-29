// @ts-nocheck
import { FiEye } from "react-icons/fi";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ApiRest from "../../service/ApiRest";
import { Meteorológico } from "./Meteorológico";
import PageMeta from "../../components/common/PageMeta";
import { Solar } from "./Solar";
import Calidad from "./Calidad";

interface Estacion {
  id: number;
  nombre: string;
  descripcion: string;
  lat: string;
  lng: string;
  id_tipo_estacion: number;
  tipo_estacion_nombre: string;
}

interface Params {
  id: string;
}

export const Monitoreo = () => {
  const { id } = useParams<Params>();
  const [estacion, setEstacion] = useState<Estacion | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID de estación no proporcionado");
      setLoading(false);
      return;
    }

    ApiRest.get(`obtenerEstacion?id=${id}`)
      .then((response) => {
        const data = response.data.data;
        if (Array.isArray(data) && data.length > 0) {
          setEstacion(data[0]);
        } else {
          setError("No se encontró la estación.");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudo cargar la estación");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const renderTipoEstacion = () => {
    if (!estacion) return null;

    switch (estacion.id_tipo_estacion) {
      case 1:
        return <Meteorológico estacion={estacion} />;
      case 2:
        return <h1>Hello world</h1>;
      case 3:
        return <Calidad estacion={estacion} />;
      case 4:
        return <Solar estacion={estacion} />;
      default:
        return <div>Tipo de estación desconocido</div>;
    }
  };

  return (
    <>
      <PageMeta
        title="Monitoreo"
        description="Monitoreo de la estación."
      />
      <div className="p-6 rounded-2xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Resumen de la estación
          </h1>
          {estacion && (
            <Link
              to={`/monitoring/variables/${estacion.id}`}
              className="mt-4 md:mt-0 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 transition-shadow shadow-md dark:bg-brand-400 dark:hover:bg-brand-500"
              aria-label="Ver todas las variables de la estación"
            >
              <FiEye className="text-lg" />
              Ver todas las variables
            </Link>
          )}
        </div>

        <div className="col-span-12 xl:col-span-5">
          {loading ? (
            <p>Cargando...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            renderTipoEstacion()
          )}
        </div>
      </div>
    </>
  );
};

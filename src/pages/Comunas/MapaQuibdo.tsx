// src/components/MapaQuibdo.tsx
import React, { useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";

type Comuna = {
  id: number;
  nombre: string;
  barrios: number;
  poblacion: number;
  x: number; // porcentaje (0-100)
  y: number; // porcentaje (0-100)
};

const comunas: Comuna[] = [
  { id: 1, nombre: "Comuna 1", barrios: 24, poblacion: 15738, x: 76.59, y: 28.18 },
  { id: 2, nombre: "Comuna 2", barrios: 19, poblacion: 12006, x: 59.21, y: 50.50 },
  { id: 3, nombre: "Comuna 3", barrios: 15, poblacion: 37937, x: 46.13, y: 15.21 },
  { id: 4, nombre: "Comuna 4", barrios: 6,  poblacion: 12279, x: 32.51, y: 36.60 },
  { id: 5, nombre: "Comuna 5", barrios: 9,  poblacion: 17502, x: 32.34, y: 62.26 },
  { id: 6, nombre: "Comuna 6", barrios: 12, poblacion: 8723,  x: 33.13, y: 15.21 },
];

export default function MapaQuibdo(): JSX.Element {
  const [seleccion, setSeleccion] = useState<Comuna | null>(null);

  // calcula estilo para el popup dependiendo de la posición (evita que salga fuera)
  const getPopupStyle = (c: Comuna) => {
    // por defecto mostramos el popup arriba-centro del marcador
    let transform = "translate(-50%, -120%)";
    // si el marcador está muy a la derecha, mostramos a la izquierda del marcador
    if (c.x > 70) transform = "translate(-105%, -50%)";
    // si está muy abajo lo mostramos encima con menos desplazamiento vertical
    if (c.y > 70) transform = "translate(-50%, -140%)";
    return {
      left: `${c.x}%`,
      top: `${c.y}%`,
      transform,
    } as React.CSSProperties;
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="relative w-full">
        {/* Imagen del mapa: colocar en public/mapa-quibdo.png */}
        <img
          src="/images/comunas.png"
          alt="Mapa de Quibdó"
          className="w-full h-auto block select-none"
        />

        {/* Marcadores */}
        {comunas.map((c) => (
          <button
            key={c.id}
            aria-label={c.nombre}
            onClick={() => setSeleccion(c)}
            className="absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
            style={{ left: `${c.x}%`, top: `${c.y}%` }}
          >
            <FaMapMarkerAlt size={35} className="text-red-600 drop-shadow" />
          </button>
        ))}

        {/* Popup */}
        {seleccion && (
          <div
            role="dialog"
            aria-modal="false"
            className="absolute z-50 w-72 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg"
            style={getPopupStyle(seleccion)}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold">{seleccion.nombre}</h3>
                <p className="text-xs text-gray-600 mt-1">
                  <span className="font-medium">Barrios:</span> {seleccion.barrios}
                </p>
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Población (2021):</span>{" "}
                  {seleccion.poblacion.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSeleccion(null)}
                className="ml-2 text-xs px-2 py-1 rounded hover:bg-gray-100"
                aria-label="Cerrar información"
              >
                ✕
              </button>
            </div>
            {/* enlace opcional al sitio oficial */}
            <a
              href="https://www.quibdo-choco.gov.co/MiMunicipio/Paginas/Informacion-del-Municipio.aspx"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-xs text-blue-600 hover:underline"
            >
              Más información
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

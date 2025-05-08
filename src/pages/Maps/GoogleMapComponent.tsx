import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  HeatmapLayer,
} from "@react-google-maps/api";
import ApiConfig from "../../service/ApiConfig";
import SidebarInfo from "./SidebarInfo";
import Images from "../../service/Images";
import ApiRest from "../../service/ApiRest";

// Interfaz extendida compatible con HistoryItem
export interface Location {
  id: number;
  nombre: string;
  descripcion: string;
  lat: string;
  lng: string;
  id_tipo_estacion: number;
  tipo_estacion: string;
}

const containerStyle = {
  width: "100%",
  height: "85vh",
};

const center = { lat: 5.69188, lng: -76.65835 };

const GoogleMapComponent: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heatmapVisible, setHeatmapVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [locationHistory, setLocationHistory] = useState<Location[]>([]);

  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBpdGMOFY0hGtNuG85onypJTTKNWWU2vwY",
    libraries: ["visualization"],
  });

  const fetchAllLocations = async () => {
    try {
      setIsLoading(true);
      const [axiosRes, fetchRes] = await Promise.all([
        ApiRest.get("estaciones"),
        fetch(`${ApiConfig.url}estaciones`),
      ]);

      const axiosData = axiosRes.data?.data || [];

      if (!fetchRes.ok) throw new Error("Error de conexión en fetch.");
      const fetchData = await fetchRes.json();

      const combined = [...axiosData, ...fetchData];

      // Validar y convertir los datos si es necesario
      const parsed: Location[] = combined.map((loc: any) => ({
        id: loc.id,
        nombre: loc.nombre,
        descripcion: loc.descripcion,
        lat: loc.lat,
        lng: loc.lng,
        id_tipo_estacion: loc.id_tipo_estacion || 0,
        tipo_estacion: loc.tipo_estacion || "Desconocido",
      }));

      setLocations(parsed);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllLocations();
  }, []);

  const handleMarkerClick = useCallback((location: Location) => {
    setLocationHistory((prev) => [location, ...prev]);
    setSidebarVisible(true);
  }, []);

  const handleClearHistory = () => {
    setLocationHistory([]);
  };

  const handleMarkerMouseOver = useCallback(() => {
    // lógica para hover (opcional)
  }, []);

  const handleMarkerMouseOut = useCallback(() => {
    // lógica para hover (opcional)
  }, []);

  if (!isLoaded) return <div>Cargando mapa...</div>;
  if (loadError) return <div>Error al cargar el mapa</div>;
  if (isLoading) return <div className="text-center mt-10">Cargando datos...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  const markerIcon = {
    url: Images.IconGeo,
    scaledSize: new window.google.maps.Size(75, 75),
  };

  const heatmapData = locations.map(
    (location) =>
      new google.maps.LatLng(parseFloat(location.lat), parseFloat(location.lng))
  );

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14.5}
        onLoad={(map) => {
          mapRef.current = map;
        }}
      >
        {heatmapVisible && (
          <HeatmapLayer
            data={heatmapData}
            options={{ radius: 120, opacity: 0.6 }}
          />
        )}

        {locations.map((location, index) => (
          <Marker
            key={index}
            position={{
              lat: parseFloat(location.lat),
              lng: parseFloat(location.lng),
            }}
            icon={markerIcon}
            onClick={() => handleMarkerClick(location)}
            onMouseOver={handleMarkerMouseOver}
            onMouseOut={handleMarkerMouseOut}
          />
        ))}
      </GoogleMap>

      <SidebarInfo
        history={locationHistory}
        visible={sidebarVisible}
        toggleVisible={() => setSidebarVisible((prev) => !prev)}
        onClearHistory={handleClearHistory}
      />

      <button
        className="absolute bottom-5 right-5 px-5 py-3 bg-lime-500 hover:bg-lime-600 text-white rounded-lg shadow-md transition"
        onClick={() => setHeatmapVisible((prev) => !prev)}
      >
        {heatmapVisible
          ? "Desactivar Mapa de Calor"
          : "Activar Mapa de Calor"}
      </button>
    </div>
  );
};

export default GoogleMapComponent;

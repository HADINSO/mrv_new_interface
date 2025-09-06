import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  HeatmapLayer,
} from "@react-google-maps/api";
import SidebarInfo from "./SidebarInfo";
import ApiRest from "../../service/ApiRest";

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

  const iconMap: Record<number, string> = {
    1: '/images/IconGeo.png',
    2: '/images/IconGeo.png',
    3: '/images/IconGeo.png',
    4: '/images/IconGeo.png',
  };

  const fetchAllLocations = async () => {
    try {
      setIsLoading(true);
      const response = await ApiRest.get("estaciones");
      setLocations(response.data.data);
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

  if (!isLoaded) return <div>Cargando mapa...</div>;
  if (loadError) return <div>Error al cargar el mapa</div>;
  if (isLoading) return <div className="text-center mt-10">Cargando datos...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  const heatmapData = locations.map(
    (location) =>
      new google.maps.LatLng(parseFloat(location.lat), parseFloat(location.lng))
  );

  // Agrupar estaciones por coordenadas
  const groupedLocations: Record<string, Location[]> = {};
  locations.forEach((loc) => {
    const key = `${loc.lat},${loc.lng}`;
    if (!groupedLocations[key]) groupedLocations[key] = [];
    groupedLocations[key].push(loc);
  });

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

        {Object.entries(groupedLocations).map(([_, locGroup]) =>
          locGroup.map((location, i) => {
            const baseLat = parseFloat(location.lat);
            const baseLng = parseFloat(location.lng);
            const offset = 0.00008; // Ajusta este valor para más o menos separación
            const angle = (i * 45 * Math.PI) / 180; // Distribución circular
            const latOffset = offset * Math.cos(angle);
            const lngOffset = offset * Math.sin(angle);

            return (
              <Marker
                key={`${location.id}-${i}`}
                position={{
                  lat: baseLat + latOffset,
                  lng: baseLng + lngOffset,
                }}
                icon={{
                  url: iconMap[location.id_tipo_estacion],
                  scaledSize: new window.google.maps.Size(60, 60),
                }}
                onClick={() => handleMarkerClick(location)}
              />
            );
          })
        )}
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
        {heatmapVisible ? "Desactivar Mapa de Calor" : "Activar Mapa de Calor"}
      </button>
    </div>
  );
};

export default GoogleMapComponent;

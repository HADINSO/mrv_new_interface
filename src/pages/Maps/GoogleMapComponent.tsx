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

interface Location {
  id: number;
  nombre: string;
  descripcion: string;
  lat: string;
  lng: string;
}

const containerStyle = {
  width: "100%",
  height: "85vh",
};

const center = { lat: 5.69188, lng: -76.65835 };

const GoogleMapComponent: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);
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

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${ApiConfig.url}estaciones`);
        if (!response.ok) throw new Error("Error de conexión.");
        const data = await response.json();
        setLocations(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLocations();
  }, []);

  const handleMarkerClick = useCallback((location: Location) => {
    setSelectedLocation(location);
    setLocationHistory((prev) => [location, ...prev]);
    setSidebarVisible(true);
  }, []);

  const handleClearHistory = () => {
    setLocationHistory([]);
    setSelectedLocation(null);
  };

  const handleMarkerMouseOver = useCallback((location: Location) => {
    setHoveredLocation(location);
  }, []);

  const handleMarkerMouseOut = useCallback(() => {
    setHoveredLocation(null);
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
    (location) => new google.maps.LatLng(parseFloat(location.lat), parseFloat(location.lng))
  );

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14.5}
        onLoad={(map) => (mapRef.current = map)}
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
            onMouseOver={() => handleMarkerMouseOver(location)}
            onMouseOut={handleMarkerMouseOut}
          />
        ))}
      </GoogleMap>

      {/* Sidebar */}
      <SidebarInfo
        history={locationHistory}
        visible={sidebarVisible}
        toggleVisible={() => setSidebarVisible((prev) => !prev)}
        onClearHistory={handleClearHistory}
      />

      {/* Botón de heatmap */}
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

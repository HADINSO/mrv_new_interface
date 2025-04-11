import React, { useState, useEffect, useRef } from "react";
import { Map, Marker, GoogleApiWrapper } from "google-maps-react";

interface MarkerData {
  id: number;
  lat: number;
  lng: number;
}

interface MapComponentProps {
  google: any;
}

const MapComponent: React.FC<MapComponentProps> = ({ google }) => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const mapRef = useRef<any>(null);

  // Coordenadas de centro del mapa (puedes ajustarlas según tu requerimiento)
  const initialCenter = { lat: 40.7128, lng: -74.0060 };

  // Simulación de carga de marcadores
  useEffect(() => {
    // Se pueden obtener datos desde una API o definir marcadores de forma estática
    const fetchMarkers = async () => {
      // Ejemplo de datos:
      const data: MarkerData[] = [
        { id: 1, lat: 40.7128, lng: -74.0060 },
        { id: 2, lat: 40.73061, lng: -73.935242 },
        { id: 3, lat: 40.758896, lng: -73.985130 },
      ];
      setMarkers(data);
    };

    fetchMarkers();
  }, []);

  return (
    <div style={{ width: "100%", height: "500px" }}>
      <Map
        google={google}
        zoom={12}
        initialCenter={initialCenter}
        ref={mapRef}
        style={{ width: "100%", height: "100%", position: "relative" }}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={{ lat: marker.lat, lng: marker.lng }}
          />
        ))}
      </Map>
    </div>
  );
};

export default GoogleApiWrapper({
  apiKey: "AIzaSyBpdGMOFY0hGtNuG85onypJTTKNWWU2vwY",
  libraries: ["places"], // Puedes agregar otras librerías, por ejemplo "visualization"
})(MapComponent);

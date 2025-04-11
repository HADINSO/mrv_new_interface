import { useEffect, useState, useRef, useCallback } from "react";
import { Map, GoogleApiWrapper, Marker } from "google-maps-react";
import Preview from "./PreviewTailwind";
import MiniModal from "./MiniModalTailwind";
import ApiConfig from "../../service/ApiConfig";
// Asegúrate de importar el objeto Images desde la ruta adecuada:
import Images from "../../assets/Images"; 

interface Location {
  id: number;
  nombre: string;
  descripcion: string;
  lat: string;
  lng: string;
}

interface MapContainerProps {
  google: any;
}

const MapContainer: React.FC<MapContainerProps> = ({ google }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [heatmapVisible, setHeatmapVisible] = useState<boolean>(false);
  const mapRef = useRef<any>(null);
  const heatmapRef = useRef<any>(null);

  const cityCoordinates = { lat: 5.69188, lng: -76.65835 };

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${ApiConfig.url}estaciones`);
        if (!response.ok) throw new Error("Error de conexión.");
        const data = await response.json();
        setLocations(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (google && google.maps && locations.length > 0 && mapRef.current) {
      const map = mapRef.current.map;
      if (!map) return;

      if (heatmapRef.current) heatmapRef.current.setMap(null);

      if (heatmapVisible) {
        heatmapRef.current = new google.maps.visualization.HeatmapLayer({
          data: locations.map(
            (location) =>
              new google.maps.LatLng(parseFloat(location.lat), parseFloat(location.lng))
          ),
          map,
          radius: 120,
          opacity: 0.6,
        });
      }
    }
  }, [google, locations, heatmapVisible]);

  const handleMarkerClick = useCallback((location: Location) => {
    setSelectedLocation(location);
    setIsModalOpen(true);
    setHoveredLocation(null);
  }, []);

  const handleMarkerMouseOver = useCallback((location: Location) => {
    setHoveredLocation(location);
  }, []);

  const handleMarkerMouseOut = useCallback(() => {
    setHoveredLocation(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedLocation(null);
  }, []);

  const markerIcon = {
    url: Images.IconGeo,
    scaledSize: new google.maps.Size(75, 75),
  };

  if (isLoading) return <div className="text-center mt-10">Cargando...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="relative w-full h-full">
      <Map
        google={google}
        zoom={14.5}
        initialCenter={cityCoordinates}
        ref={mapRef}
      >
        {locations.map((location, index) => (
          <Marker
            key={index}
            position={{
              lat: parseFloat(location.lat),
              lng: parseFloat(location.lng),
            }}
            icon={markerIcon}
            onClick={() => handleMarkerClick(location)}
            onMouseover={() => handleMarkerMouseOver(location)}
            onMouseout={handleMarkerMouseOut}
          />
        ))}
      </Map>

      {hoveredLocation && <MiniModal location={hoveredLocation} />}
      <Preview isOpen={isModalOpen} onClose={handleCloseModal} location={selectedLocation} />

      <button
        className="absolute bottom-5 right-5 px-5 py-3 bg-lime-500 hover:bg-lime-600 text-white rounded-lg shadow-md transition"
        onClick={() => setHeatmapVisible((prev) => !prev)}
      >
        {heatmapVisible ? "Desactivar Mapa de Calor" : "Activar Mapa de Calor"}
      </button>
    </div>
  );
};

export default GoogleApiWrapper({
  apiKey: "AIzaSyBpdGMOFY0hGtNuG85onypJTTKNWWU2vwY",
  libraries: ["visualization"],
})(MapContainer);

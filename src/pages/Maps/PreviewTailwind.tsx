import Modal from "react-modal";
import MiniModal from "./MiniModalTailwind";

// Si ya tienes la interfaz Location definida en otro lugar, puedes importarla. 
// Para este ejemplo, se define una versión mínima aquí:
interface Location {
  id: number;
  nombre: string;
  descripcion: string;
  lat?: string;
  lng?: string;
}

interface PreviewProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location | null;
}

Modal.setAppElement("#root");

const modalStyles = {
  content: {
    width: "90%",
    maxWidth: "800px",
    height: "80%",
    margin: "auto",
    borderRadius: "1rem",
    padding: "2rem",
    overflow: "auto",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
};

const Preview: React.FC<PreviewProps> = ({ isOpen, onClose, location }) => {
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={modalStyles}>
      {location && <MiniModal location={location} />}
    </Modal>
  );
};

export default Preview;

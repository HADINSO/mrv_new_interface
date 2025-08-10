import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

interface Imagen {
  imagen: string;
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const imagenes: Imagen[] = [
    { imagen: "AJRY4167.JPG" },
    { imagen: "AZNT5727.JPG" },
    { imagen: "BGNQ8178.JPG" },
    { imagen: "BTYI3160.JPG" },
    { imagen: "CMKS7199.JPG" },
    { imagen: "CUPB8120.JPG" },
    { imagen: "DDHT8849.JPG" },
    { imagen: "DIWZ5895.JPG" },
    { imagen: "DSSY8256.JPG" },
    { imagen: "FWJZ3112.JPG" },
    { imagen: "LNKN7981.JPG" },
    { imagen: "MGZZ4320.JPG" },
    { imagen: "NKJB4793.JPG" },
    { imagen: "RQPA9933.JPG" },
    { imagen: "SSZG2119.JPG" },
    { imagen: "UZEO7661.JPG" },
    { imagen: "VBIV5283.JPG" },
    { imagen: "WTZB4461.JPG" },
  ];

  // Selección aleatoria de imagen solo al renderizar el componente
  const imagenAleatoria = useMemo(() => {
    const index = Math.floor(Math.random() * imagenes.length);
    return imagenes[index].imagen;
  }, []);

  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}

        <div className="relative hidden w-full h-full lg:w-1/2 lg:grid overflow-hidden">
          {/* Imagen de fondo aleatoria */}
          <img
            src={`/images/ubi/${imagenAleatoria}`}
            alt="Fotos del Chocó"
            className="absolute inset-0 object-cover w-full h-full z-0"
          />

          {/* Overlay oscuro */}
          <div className="absolute inset-0 bg-black/50 z-0" />

          {/* Contenido centrado */}
          <div className="relative z-10 flex items-center justify-center w-full h-full px-6">
            <div className="flex flex-col items-center max-w-md text-white text-lg space-y-4">
              <Link to="/" className="block mb-4">
                <img
                  width={250}
                  height={60}
                  src="/images/mrv_logo.png"
                  alt="Logo"
                />
              </Link>
              <p className="text-center leading-relaxed">
                Accede a <strong>mrvmonitor.com</strong> <br />
                Fotos: <em>Yuver Rengifo</em>.
              </p>
            </div>
          </div>
        </div>

        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}

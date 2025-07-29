import React from "react";
import { Link } from "react-router-dom";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}

        <div className="relative hidden w-full h-full lg:w-1/2 lg:grid overflow-hidden">
          {/* Imagen de fondo */}
          <img
            src="/images/shape/cer_max.jpg"
            alt="grid"
            className="absolute inset-0 object-cover w-full h-full z-0"
          />

          {/* Overlay oscuro */}
          <div className="absolute inset-0 bg-black/50 z-0" />

          {/* Contenido centrado y ampliado */}
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
                Foto: <em>Cértegui, Chocó - Colombia</em>.
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

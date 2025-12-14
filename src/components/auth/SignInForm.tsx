import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate, useParams } from "react-router-dom";
// Asumiendo que Input, Label, ChevronLeftIcon, EyeCloseIcon, EyeIcon, y Button son componentes funcionales.
// Se recomienda usar un input genérico más robusto o el nativo si es posible, o que 'Input' reciba 'id'.
import Input from "../form/input/InputField"; // Sugerencia: Renombrar a TextInput
import Label from "../form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Button from "../ui/button/Button";
import toast from "react-hot-toast";

// **Mejora de Código:** Usar una sola variable para estados relacionados con el formulario y una constante para el icono
const INITIAL_FORM_STATE = {
  email: "",
  password: "",
};
const ICON_SIZE_CLASS = "w-5 h-5";

export default function SignInForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { ruta } = useParams<{ ruta: string }>();

  // **Mejora de Código:** Usar 'email' en lugar de 'username' para claridad en el formulario.
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // **Mejora de UX:** Deshabilitar el envío si los campos están vacíos antes de la carga
    if (!form.email.trim() || !form.password) {
      toast.error("Por favor, completa ambos campos.");
      return;
    }

    const rutaDecodificada = ruta ? decodeURIComponent(ruta) : "/";

    setLoading(true);
    try {
      await login(form.email, form.password); // Usar form.email
      toast.success("Inicio de sesión exitoso 🎉");
      navigate(rutaDecodificada);
    } catch (error) {
      // **Mejora de UX/Seguridad:** Mensaje de error más general.
      toast.error("Credenciales incorrectas o error en el servidor. Inténtalo de nuevo.");
      // Opcional: Limpiar la contraseña después de un error por seguridad
      setForm((prev) => ({ ...prev, password: "" }));
    } finally {
      setLoading(false);
    }
  };

  const isFormInvalid = !form.email.trim() || form.password.length < 1; // Ajusta la validación mínima

  return (
    <div className="flex flex-col flex-1 min-h-screen px-4 py-8 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      {/* Volver */}
      <div className="w-full max-w-lg mx-auto mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-green-700 dark:text-gray-400 dark:hover:text-green-400 transition-colors group"
          aria-label="Volver a la aplicación principal"
        >
          <ChevronLeftIcon className={`${ICON_SIZE_CLASS} mr-1 transition-transform group-hover:-translate-x-0.5`} />
          Volver a la aplicación
        </Link>
      </div>

      {/* Contenedor principal */}
      <div className="flex flex-col justify-center flex-1 w-full max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-3xl p-8 sm:p-12 lg:p-14 transition-all duration-300 transform hover:shadow-green-500/20"> 
        
        {/* Encabezado */}
        <div className="mb-8 text-center">
          {/* **Mejora de Estética:** Ajuste de tamaño y margen del icono */}
          <img
            src="/images/IconGeo.png" // Asegúrate de que esta ruta sea correcta
            alt="Icono de la aplicación"
            className="w-20 h-20 mx-auto mb-6 drop-shadow-lg" 
          />
          <h1 className="mb-3 text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Bienvenido de vuelta
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400">
            Inicia sesión para acceder a tu cuenta.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Email */}
          <div>
            {/* **Mejora A11Y:** Usar el atributo 'htmlFor' en el Label y 'id' en el Input. */}
            <Label htmlFor="email-input" className="text-gray-700 dark:text-gray-300 font-semibold mb-2 block">
              Correo electrónico <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email-input"
              name="email"
              type="text"
              value={form.email}
              onChange={handleInputChange}
              aria-required="true"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-green-400/50 focus:border-green-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-all duration-200 shadow-sm"
            />
          </div>

          {/* Contraseña */}
          <div>
            <Label htmlFor="password-input" className="text-gray-700 dark:text-gray-300 font-semibold mb-2 block">
              Contraseña <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password-input"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={handleInputChange}
                aria-required="true"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-green-400/50 focus:border-green-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-all duration-200 shadow-sm"
              />
              {/* **Mejora de UX/A11Y:** Usar un <button> para el toggle de contraseña para mejor accesibilidad con teclado. */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-green-600 transition-colors p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <EyeIcon className={ICON_SIZE_CLASS} />
                ) : (
                  <EyeCloseIcon className={ICON_SIZE_CLASS} />
                )}
              </button>
            </div>
          </div>
          
          {/* Enlace de 'Olvidé mi contraseña' (Mejora de UX) */}
          <div className="text-right">
              <Link to="/forgot-password" className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-500 transition-colors hover:underline">
                  ¿Olvidaste tu contraseña?
              </Link>
          </div>

          {/* Botón */}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full py-3 text-lg font-bold rounded-xl bg-green-600 text-white shadow-lg shadow-green-500/30 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-400 transition-all duration-300 transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || isFormInvalid} // Deshabilitar si está cargando O si el formulario es inválido
            >
              {loading ? (
                <>
                    {/* **Mejora de UX:** Añadir un spinner de carga */}
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando sesión...
                </>
              ) : (
                "Acceder a la Plataforma"
              )}
            </Button>
          </div>
          
          {/* Enlace a Registro */}
          <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
            ¿No tienes una cuenta aún? 
            <Link to="/signup" className="ml-1 font-semibold text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-500 hover:underline transition-colors">
              Regístrate aquí
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
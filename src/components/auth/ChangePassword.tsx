//@ts-ignore
import { useState } from "react";
import { Link } from "react-router";
import Swal from "sweetalert2";
import Helper from "../../service/Helper";
import ChangePasswordValidation from "./ChangePasswordValidation";

interface ChangePasswordPayload {
  email: string;
  ChangePassword: boolean;
}

const ChangePassword: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [enviado, setEnviado] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.includes("@")) {
      Swal.fire("Error", "Email no válido", "error");
      return;
    }

    setLoading(true);

    try {

      const searchResponse = await fetch(
        `${Helper.url}ChangePassword.php?buscarEmail2=${encodeURIComponent(
          email
        )}`
      );
      const searchData = await searchResponse.json();

      if (!searchData.exists) {
        Swal.fire(
          "Error",
          "El email no está registrado",
          "error"
        );
        setLoading(false);
        return;
      }

      const payload: ChangePasswordPayload = {
        email,
        ChangePassword: true,
      };

      const response = await fetch(`${Helper.url}ChangePassword.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Swal.fire(
          "Correo enviado",
          "Revisa tu email para continuar",
          "success"
        );
        setEnviado(true);
      } else {
        Swal.fire(
          "Error",
          "No se pudo procesar la solicitud",
          "error"
        );
      }
    } catch {
      Swal.fire(
        "Error",
        "Error de conexión con el servidor",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (enviado) return <ChangePasswordValidation />;

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Recuperar cuenta</h1>

      <p className="text-sm text-gray-500">
        Ingresa tu correo registrado y te enviaremos un código.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Correo electrónico"
          className="w-full px-4 py-3 border rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-white bg-brand-500 rounded-lg"
        >
          {loading ? "Enviando..." : "Restablecer contraseña"}
        </button>
      </form>

      <p className="text-sm text-center">
        <Link to="/signin" className="text-brand-500">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
};

export default ChangePassword;

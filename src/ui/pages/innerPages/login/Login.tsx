// Login.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDependencies } from "../../../context/useDependencies";
import { apiService } from "../../../../infrastructure/api/apiService";
import { jwtDecode } from "jwt-decode";
import { SignalRGameHub } from "../../../../infrastructure/signalr/SignalRGameHub";
import * as S from "./Login.styles"; // <-- Importación de los estilos agregada
import { AppRoutes } from "../../layout/AppRoutes";
import { env } from "../../../utils/HelperConfigs";

export const Login = () => {
  const { onlineRepository } = useDependencies();

  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user.trim() || !password.trim()) {
      setError("Completa usuario y password para continuar.");
      return;
    }

    setError("");

    try {
      setIsSubmitting(true);

      const response = await apiService.loginUser(user, password);

      const data = response.data as {
        jbearer?: string;
        token?: string;
        authToken?: string;
      };

      const token = data?.jbearer ?? data?.token ?? data?.authToken;

      if (token) {
        try {
          const decodedToken = jwtDecode<{ sub?: string }>(token);

          onlineRepository.setAuthToken(token);
          onlineRepository.savePlayerId(decodedToken.sub || user.trim());
          onlineRepository.savePlayerName(user.trim());

          SignalRGameHub.setCredentials(env.signalRHubUrl(), token);
          SignalRGameHub.initializeInstance();

          navigate(AppRoutes.home);
        } catch (decodeError) {
          console.error("Error al decodificar el token:", decodeError);
          setError("Token inválido recibido del servidor.");
        }
      } else {
        setError("La API no devolvio un token de autenticacion.");
      }
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        const apiMessage =
          typeof requestError.response?.data === "string"
            ? (requestError.response.data as string)
            : "Usuario o password invalidos.";
        setError(apiMessage);
      } else {
        setError("No fue posible iniciar sesion.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <S.Page>
      <S.Card>
        <S.Title>Iniciar sesion</S.Title>
        <S.Subtitle>Accede para guardar tu progreso y jugar online.</S.Subtitle>

        <form onSubmit={handleSubmit}>
          <S.Label htmlFor="user">Usuario</S.Label>
          <S.Input
            id="user"
            type="text"
            value={user}
            onChange={(event) =>
              setUser(event.target.value.toLowerCase().trim())
            }
            placeholder="tu_usuario"
            autoComplete="username"
          />

          <S.Label htmlFor="password">Password</S.Label>
          <S.Input
            id="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value.toLowerCase().trim())
            }
            placeholder="******"
            autoComplete="current-password"
          />

          {error ? <S.ErrorText>{error}</S.ErrorText> : null}

          <S.Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Entrando..." : "Entrar"}
          </S.Button>
        </form>

        <S.Version>v{env.appVersion()}</S.Version>
      </S.Card>
    </S.Page>
  );
};

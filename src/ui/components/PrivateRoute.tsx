import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AppRoutes } from "../pages/layout/AppRoutes";
import { useConnectionStatus } from "../hooks/useConnectionStatus";

export const PrivateRoute = () => {
  const status = useConnectionStatus();
  const navigate = useNavigate();
  const hasToken = Boolean(localStorage.getItem("auth-jbearer-token"));

  useEffect(() => {
    if (!hasToken) {
      navigate(AppRoutes.login, { replace: true });
    }
  }, [hasToken, navigate]);

  // Sin token → nada (el useEffect ya redirige)
  if (!hasToken) return null;

  // Tiene token pero aún conectando → loading
  if (status !== 2)
    return <div style={{ color: "#fff", padding: 24 }}>Conectando...</div>;

  return <Outlet />;
};

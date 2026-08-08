import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useConnectionStatus } from "../../hooks/useConnectionStatus";
import { ConnectionStatus } from "../../components/connection/ConnectionStatus";
import { BadgeNewChatMessage } from "../../components/badgeNewChatMessage/BadgeNewChatMessage";
import { AppRoutes } from "./AppRoutes";
import {
  LayoutContainer,
  MainContent,
  BottomNav,
  NavButton,
  NavLabel,
  BoardIcon,
  PhotosIcon,
  ChatIcon,
  LobbyIcon,
  ProfileIcon,
} from "./Layout.styles";

export const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const connectionStatus = useConnectionStatus();

  const isLoggedIn = connectionStatus === 2;

  const PROTECTED_ROUTES: string[] = [
    AppRoutes.gameBoard,
    AppRoutes.uploadPhotos,
    AppRoutes.gameLobby,
    AppRoutes.chat,
    AppRoutes.profile,
  ];

  const canAccess = (path: string): boolean => {
    if (PROTECTED_ROUTES.includes(path)) return isLoggedIn;
    return true;
  };

  // Definimos los items dentro para poder reaccionar al estado de login
  const navItems = [
    { label: "Board", path: AppRoutes.gameBoard, icon: <BoardIcon /> },
    { label: "Fotos", path: AppRoutes.uploadPhotos, icon: <PhotosIcon /> },
    { label: "Chat", path: AppRoutes.chat, icon: <ChatIcon /> },
    { label: "Lobby", path: AppRoutes.gameLobby, icon: <LobbyIcon /> },
    {
      // Cambio dinámico: si está logueado muestra Perfil, si no Sesión
      label: isLoggedIn ? "Perfil" : "Sesión",
      path: isLoggedIn ? AppRoutes.profile : AppRoutes.login,
      icon: <ProfileIcon />,
    },
  ];

  return (
    <LayoutContainer>
      <MainContent>
        <Outlet />
      </MainContent>

      <BottomNav>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavButton
              key={item.path}
              onClick={() => canAccess(item.path) && navigate(item.path)}
              disabled={!canAccess(item.path)}
              $isActive={isActive}
              $canAccess={canAccess(item.path)}
            >
              {item.icon}
              <NavLabel>{item.label}</NavLabel>

              {item.path === AppRoutes.chat && (
                <BadgeNewChatMessage location={location.pathname} />
              )}

              {/* Mantenemos el ConnectionStatus en el último botón (Sesión/Perfil) */}
              {(item.path === AppRoutes.login ||
                item.path === AppRoutes.profile) && <ConnectionStatus />}
            </NavButton>
          );
        })}
      </BottomNav>
    </LayoutContainer>
  );
};

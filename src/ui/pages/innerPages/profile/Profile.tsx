import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PlayerStats } from "./PlayerStats";
import { useDependencies } from "../../../context/useDependencies";
import { usePlayer } from "../../../hooks/usePlayer";
import { apiService } from "../../../../infrastructure/api/apiService";
import { AppRoutes } from "../../layout/AppRoutes";
import {
  ProfileWrapper,
  UserHeader,
  Avatar,
  StatGrid,
  StatCard,
  StatValue,
  StatLabel,
  LogoutButton,
  PlayerName,
  PlayerSubtitle,
  FooterText,
} from "./Profile.styles";

export const Profile = () => {
  const navigate = useNavigate();
  const { playerId, playerName } = usePlayer();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { onlineRepository } = useDependencies();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiService.getUserStatsById(playerId);
        const data = response.data;
        setStats(data);
      } catch (error) {
        console.error("Error cargando estadísticas del backend:", error);
      } finally {
        setLoading(false);
      }
    };

    if (playerId) {
      fetchStats();
    }
  }, [playerId]);

  const handleLogout = async () => {
    if (window.confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      await onlineRepository.clearAll();

      navigate(AppRoutes.login);
    }
  };

  if (loading) {
    return <ProfileWrapper>Cargando estadísticas...</ProfileWrapper>;
  }

  return (
    <ProfileWrapper>
      <UserHeader>
        <Avatar>{playerName?.charAt(0).toUpperCase()}</Avatar>
        <div>
          <PlayerName>{playerName}</PlayerName>
          <PlayerSubtitle>Jugador Activo</PlayerSubtitle>
        </div>
      </UserHeader>

      <StatGrid>
        <StatCard>
          <StatValue $color="#4cd137">{stats?.totalMoves || 0}</StatValue>
          <StatLabel>Movimientos Totales</StatLabel>
        </StatCard>

        <StatCard>
          <StatValue $color="#e84118">{stats?.totalFails || 0}</StatValue>
          <StatLabel>Derrotas</StatLabel>
        </StatCard>

        <StatCard style={{ gridColumn: "span 2" }}>
          <StatValue $color="#00a8ff">
            {stats?.totalMatchs.toFixed(1) || "0.0"}
          </StatValue>
          <StatLabel>Promedio de Puntuación</StatLabel>
        </StatCard>
      </StatGrid>

      <FooterText>
        Total de partidas registradas: {stats?.totalMatchs || 0}
      </FooterText>

      <LogoutButton onClick={handleLogout}>Cerrar Sesión</LogoutButton>
    </ProfileWrapper>
  );
};

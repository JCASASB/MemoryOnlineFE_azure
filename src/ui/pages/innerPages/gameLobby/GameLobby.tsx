// GameLobby.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../../../hooks/usePlayer";
import { useUCs } from "../../../hooks/useUCs";
import { useDependencies } from "../../../context/useDependencies";
import type { Challenge } from "../../../../core/chat/domain/entities/Challenge";
import { ItemChallenge } from "../../../components/itemChallenge/ItemChallenge";
import * as S from "./GameLobby.styles"; // <-- Importación de los estilos agregada
import { AppRoutes } from "../../layout/AppRoutes";

export const GameLobby = () => {
  const { playerName, playerId } = usePlayer();
  const { onlineRepository } = useDependencies();
  const { joinGameByMatchIdUC } = useUCs();
  const navigate = useNavigate();

  const [challenges, setChallenges] = useState<Challenge[]>(() =>
    onlineRepository.getChallenges(),
  );
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onlineRepository.subscribeToChallenges((challenge) => {
      setChallenges((prev) => [...prev, challenge]);
    });
    return unsub;
  }, [onlineRepository]);

  const handleJoin = async (challenge: Challenge) => {
    console.log("Joining challenge:", challenge);
    setJoiningId(challenge.id);
    try {
      joinGameByMatchIdUC(challenge.matchId, playerName, playerId).then(() => {
        navigate(
          `${AppRoutes.gameBoard}?matchId=${encodeURIComponent(challenge.matchId)}`,
        );
      });
    } catch (err) {
      console.error("Error joining challenge:", err);
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <S.Wrapper>
      <S.Title>Desafíos pendientes</S.Title>
      {challenges.length === 0 ? (
        <S.EmptyMessage>
          No hay desafíos disponibles por el momento.
        </S.EmptyMessage>
      ) : (
        <S.ChallengeList>
          {challenges.map((challenge) => (
            <ItemChallenge
              key={challenge.id}
              challenge={challenge}
              joiningId={joiningId}
              handleJoin={handleJoin}
            />
          ))}
        </S.ChallengeList>
      )}
    </S.Wrapper>
  );
};

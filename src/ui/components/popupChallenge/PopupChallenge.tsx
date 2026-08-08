// PopupChallenge.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../../hooks/usePlayer";
import { useUCs } from "../../hooks/useUCs";
import { AppRoutes } from "../../pages/layout/AppRoutes";
import * as S from "./PopupChallenge.styles"; // <-- Importación de los estilos agregada

const ADJECTIVES = [
  "rapido",
  "furioso",
  "astuto",
  "veloz",
  "feroz",
  "noble",
  "bravo",
  "listo",
  "audaz",
  "fiero",
];
const NOUNS = [
  "leon",
  "tigre",
  "aguila",
  "lobo",
  "zorro",
  "oso",
  "puma",
  "halcon",
  "jaguar",
  "cobra",
];

const generateGameName = () => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `${adj}-${noun}-${num}`;
};

type PopupChallengeProps = {
  opponentName: string;
  opponentIdPlayer: string;
  onClose: () => void;
};

export const PopupChallenge = ({
  opponentName,
  opponentIdPlayer,
  onClose,
}: PopupChallengeProps) => {
  const navigate = useNavigate();
  const { createMatchUC, createChallengeUC } = useUCs();
  const { playerId } = usePlayer();

  const [gameName] = useState(generateGameName);
  const [level, setLevel] = useState("3");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError("");

    try {
      const match = await createMatchUC(Number(level), gameName);

      await createChallengeUC(match.id, playerId, opponentIdPlayer);

      navigate(
        `${AppRoutes.gameBoard}?level=${level}&gameName=${encodeURIComponent(gameName)}`,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear la partida.",
      );
      setIsCreating(false);
    }
  };

  return (
    <S.Overlay onClick={onClose}>
      <S.Modal onClick={(e) => e.stopPropagation()}>
        <S.Title>Retar a {opponentName}</S.Title>
        <S.GameNameBox>
          <S.GameNameLabel>Sala</S.GameNameLabel>
          <S.GameNameValue>{gameName}</S.GameNameValue>
        </S.GameNameBox>
        <S.Form onSubmit={handleCreate}>
          <S.Label>
            Nivel
            <S.Select value={level} onChange={(e) => setLevel(e.target.value)}>
              {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  Nivel {n}
                </option>
              ))}
            </S.Select>
          </S.Label>
          <S.ButtonRow>
            <S.CancelButton type="button" onClick={onClose}>
              Cancelar
            </S.CancelButton>
            <S.CreateButton type="submit" disabled={isCreating}>
              {isCreating ? "Creando..." : "Crear partida"}
            </S.CreateButton>
          </S.ButtonRow>
        </S.Form>
        {error && <S.ErrorMsg>{error}</S.ErrorMsg>}
      </S.Modal>
    </S.Overlay>
  );
};

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PreventPullToRefresh from "../../../PreventPullToRefresh";
import { useDependencies } from "../../../context/useDependencies";
import { usePlayer } from "../../../hooks/usePlayer";
import { useGameState } from "../../../hooks/useGameState";
import { useUCs } from "../../../hooks/useUCs";
import { useAnimations } from "../../../hooks/useAnimations";
import { ScoreBoard } from "../../../components/scoreBoard/ScoreBoard";
import { MemoryCard } from "../../../components/card/MemoryCard";
import { StateCard } from "../../../../core/game/domain/entities/StateCard";
import { createBabylonBoard } from "./createBabylonBoard";
import * as Board from "../gameBoard/GameBoard.styles";
import * as S from "./GameBoardBabylon.styles";

export const GameBoardBabylon = () => {
  const { playerId } = usePlayer();
  const { onlineRepository, signalRGameHub } = useDependencies();
  const [searchParams] = useSearchParams();
  const matchKey = searchParams.get("matchId") ?? "";
  const { stateGame } = useGameState(matchKey);
  const { flipCardUC, checkCardsUC } = useUCs();
  const { addAnimationInProgress, removeAnimationInProgress } = useAnimations();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ReturnType<typeof createBabylonBoard> | null>(null);
  const processingRef = useRef(false);
  const [webglUnavailable, setWebglUnavailable] = useState(false);
  const canPlay = stateGame.players.some(p => p.id === playerId && p.turn && p.remainMoves > 0);

  useEffect(() => {
    let cancelled = false;
    const resume = async () => {
      try {
        const storedMatch = await onlineRepository.getMatchId();
        if (cancelled || (matchKey && storedMatch !== matchKey)) return;
        // A refreshed SignalR connection has no group membership yet.
        await signalRGameHub.sendJoinGame(storedMatch);
        const states = await signalRGameHub.getServerStatesFromVersion(storedMatch, 0);
        if (!cancelled && states) await onlineRepository.addStatesToTheQueue(states);
      } catch (error) {
        if (!cancelled) console.error("No se pudo recuperar la partida del servidor:", error);
      }
    };
    void resume();
    return () => { cancelled = true; };
  }, [matchKey, onlineRepository, signalRGameHub]);

  const flip = useCallback(async (id: string) => {
    if (processingRef.current || !canPlay) return;
    processingRef.current = true;
    try {
      const version = await flipCardUC(id, playerId);
      await checkCardsUC(version);
    } catch (error) {
      console.error("Error al girar la carta:", error);
    } finally {
      processingRef.current = false;
    }
  }, [canPlay, flipCardUC, checkCardsUC, playerId]);

  // The scene lives for the page lifetime; callbacks use the latest React state.
  const latest = useRef({ flip, addAnimationInProgress, removeAnimationInProgress });
  useEffect(() => {
    latest.current = { flip, addAnimationInProgress, removeAnimationInProgress };
  }, [flip, addAnimationInProgress, removeAnimationInProgress]);
  useEffect(() => {
    if (!canvasRef.current) return;
    try {
      const board = createBabylonBoard(canvasRef.current, {
        flip: id => { void latest.current.flip(id); },
        start: id => latest.current.addAnimationInProgress(id),
        finish: id => latest.current.removeAnimationInProgress(id),
      });
      rendererRef.current = board;
      return () => {
        rendererRef.current = null;
        board.dispose();
      };
    } catch (error) {
      console.error("No se pudo iniciar Babylon.js:", error);
      setWebglUnavailable(true);
    }
  }, [matchKey]);
  useEffect(() => {
    rendererRef.current?.update(stateGame.cards);
  }, [stateGame.cards, matchKey]);

  return (
    <PreventPullToRefresh>
      <Board.BoardWrapper>
        <Board.StickyHeader>
          <ScoreBoard players={stateGame.players} myPlayerId={playerId} matchName={stateGame.name} />
        </Board.StickyHeader>
        {stateGame.players.length < 2 && (
          <Board.WaitingMessage><Board.Header>Esperando jugador...</Board.Header></Board.WaitingMessage>
        )}
        {webglUnavailable ? (
          <>
            <p role="status">WebGL no está disponible. Se muestra el tablero clásico.</p>
            <Board.Grid $columns={Math.max(1, Math.ceil(Math.sqrt(stateGame.cards.length)))}>
              {stateGame.cards.map(card => <MemoryCard key={card.id} {...card} stateCard={card.state} flip={flip} />)}
            </Board.Grid>
          </>
        ) : (
          <>
            <S.Canvas ref={canvasRef} aria-label="Tablero Memory en 3D. Usa los controles inferiores para jugar con teclado." />
            <details>
              <summary>Jugar con teclado</summary>
              <S.KeyboardCards>
                {stateGame.cards.map((card, index) => (
                  <button key={card.id} type="button"
                    disabled={!canPlay || card.state !== StateCard.FaceDown}
                    onClick={() => { void flip(card.id); }}>
                    {card.state === StateCard.FaceDown ? `Carta ${index + 1}` :
                      card.state === StateCard.Matched ? `Pareja ${card.value}` : card.value}
                  </button>
                ))}
              </S.KeyboardCards>
            </details>
          </>
        )}
      </Board.BoardWrapper>
    </PreventPullToRefresh>
  );
};

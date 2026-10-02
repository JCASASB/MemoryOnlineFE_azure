import { useEffect, useState } from "react";
import { useDependencies } from "../context/useDependencies";
import { Game } from "../../core/game/domain/entities/Game";

/**
 * Reads queued states serially. A match change cancels results from the old reader.
 * The worker only schedules ticks; the repository controls versions and animations.
 */
export const useGameState = (matchKey = "") => {
  const [stateGame, setStateGame] = useState<Game>(new Game("", "", 0, 0));
  const { getNextStateUseCase, getLastAppliedStateUseCase } = useDependencies();

  useEffect(() => {
    let cancelled = false;
    let reading = false;
    let initialized = false;
    setStateGame(new Game("", "", 0, 0));

    const readState = async () => {
      if (cancelled || reading) return;
      reading = true;
      try {
        const state = initialized
          ? await getNextStateUseCase.execute()
          : await getLastAppliedStateUseCase.execute();
        if (cancelled) return;
        if (state) {
          initialized = true;
          setStateGame(state);
        }
      } catch (error) {
        if (!cancelled) console.error("No se pudo leer el estado de la partida:", error);
      } finally {
        reading = false;
      }
    };

    const worker = new Worker(new URL("./dbWorker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (event: MessageEvent) => {
      if (event.data.type === "UPDATE_READY") void readState();
    };
    void readState();
    worker.postMessage("start");
    return () => {
      cancelled = true;
      worker.terminate();
    };
  }, [matchKey, getNextStateUseCase, getLastAppliedStateUseCase]);

  return { stateGame };
};

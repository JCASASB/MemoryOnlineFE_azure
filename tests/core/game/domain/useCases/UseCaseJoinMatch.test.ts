import { Game } from "@core/game/domain/entities/Game";
import { StateCard } from "@core/game/domain/entities/StateCard";
import { UseCaseJoinMatch } from "@core/game/domain/useCases/UseCaseJoinMatch";
import { card, player } from "./fixtures";

describe("UseCaseJoinMatch", () => {
  it("agrega el primer jugador con el turno y aumenta la version", () => {
    // El primer jugador de la partida debe comenzar con dos movimientos y el turno activo.
    const game = new Game(
      "game-1",
      "partida",
      1,
      2,
      [card("card-1", 1)],
    );

    const result = new UseCaseJoinMatch().execute(game, "Ana", "player-1");

    expect(result.version).toBe(3);
    expect(result.players).toHaveLength(1);
    expect(result.players[0]).toMatchObject({
      id: "player-1",
      name: "Ana",
      order: 0,
      remainMoves: 2,
      turn: true,
    });
  });

  it("rechaza jugadores repetidos y partidas terminadas", () => {
    // Ambas situaciones invalidan la incorporacion y deben fallar de forma explicita.
    const withPlayer = new Game(
      "game-1",
      "partida",
      1,
      2,
      [card("card-1", 1)],
      [player("player-1", true)],
    );
    const finished = new Game(
      "game-2",
      "terminada",
      1,
      2,
      [card("card-1", 1, StateCard.Matched)],
    );
    const useCase = new UseCaseJoinMatch();

    expect(() => useCase.execute(withPlayer, "Ana", "player-1")).toThrow(
      "Player already in the game or game is finished",
    );
    expect(() => useCase.execute(finished, "Luis", "player-2")).toThrow(
      "Player already in the game or game is finished",
    );
  });
});

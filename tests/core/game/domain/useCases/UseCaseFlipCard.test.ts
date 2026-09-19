import { Game } from "@core/game/domain/entities/Game";
import { StateCard } from "@core/game/domain/entities/StateCard";
import { UseCaseFlipCard } from "@core/game/domain/useCases/UseCaseFlipCard";
import { card, player } from "./fixtures";

describe("UseCaseFlipCard", () => {
  it("gira una carta y descuenta un movimiento al jugador que tiene el turno", () => {
    // Se prepara un estado valido: jugador activo, movimientos disponibles y carta boca abajo.
    const game = new Game(
      "game-1",
      "partida",
      1,
      3,
      [card("card-1", 7)],
      [player("player-1", true, 2, 4)],
    );

    const result = new UseCaseFlipCard().execute(
      game,
      "card-1",
      "player-1",
    );

    expect(result).toBeDefined();
    expect(result?.version).toBe(4);
    expect(result?.cards[0].state).toBe(StateCard.FaceUp);
    expect(result?.players[0]).toMatchObject({
      remainMoves: 1,
      totalMoves: 5,
      turn: true,
    });
    expect(game.cards[0].state).toBe(StateCard.FaceDown);
  });

  it.each([
    ["el jugador no tiene el turno", player("player-1", false, 2)],
    ["el jugador no tiene movimientos", player("player-1", true, 0)],
  ])("no modifica el juego cuando %s", (_description, currentPlayer) => {
    // Un intento invalido debe devolverse como undefined y conservar el estado original.
    const game = new Game(
      "game-1",
      "partida",
      1,
      3,
      [card("card-1", 7)],
      [currentPlayer],
    );

    expect(
      new UseCaseFlipCard().execute(game, "card-1", "player-1"),
    ).toBeUndefined();
    expect(game.version).toBe(3);
    expect(game.cards[0].state).toBe(StateCard.FaceDown);
  });
});

import { Game } from "@core/game/domain/entities/Game";
import { StateCard } from "@core/game/domain/entities/StateCard";
import { UseCaseCheckCards } from "@core/game/domain/useCases/UseCaseCheckCards";
import { card, player } from "./fixtures";

describe("UseCaseCheckCards", () => {
  it("marca la pareja, suma un punto y mantiene el turno", () => {
    // Dos cartas levantadas con el mismo valor constituyen una pareja valida.
    const game = new Game(
      "game-1",
      "partida",
      2,
      5,
      [
        card("card-1", 9, StateCard.FaceUp),
        card("card-2", 9, StateCard.FaceUp),
      ],
      [player("player-1", true, 0, 2, 1), player("player-2", false)],
    );

    const result = new UseCaseCheckCards().execute(game);

    expect(result?.version).toBe(6);
    expect(
      result?.cards.every((item) => item.state === StateCard.Matched),
    ).toBe(true);
    expect(result?.players[0]).toMatchObject({
      points: 2,
      remainMoves: 2,
      turn: true,
    });
    expect(result?.players[1].turn).toBe(false);
  });

  it("oculta cartas distintas y cambia el turno", () => {
    // Un fallo termina el turno actual y entrega el turno al otro jugador.
    const game = new Game(
      "game-1",
      "partida",
      2,
      5,
      [
        card("card-1", 1, StateCard.FaceUp),
        card("card-2", 2, StateCard.FaceUp),
      ],
      [player("player-1", true, 0), player("player-2", false)],
    );

    const result = new UseCaseCheckCards().execute(game);

    expect(
      result?.cards.every((item) => item.state === StateCard.FaceDown),
    ).toBe(true);
    expect(result?.players[0]).toMatchObject({ turn: false, remainMoves: 2 });
    expect(result?.players[1].turn).toBe(true);
  });

  it("no genera un estado nuevo mientras no haya dos cartas levantadas", () => {
    // Comprobar antes de la segunda seleccion no debe incrementar la version.
    const game = new Game(
      "game-1",
      "partida",
      2,
      5,
      [card("card-1", 1, StateCard.FaceUp), card("card-2", 1)],
    );

    expect(new UseCaseCheckCards().execute(game)).toBeUndefined();
  });
});

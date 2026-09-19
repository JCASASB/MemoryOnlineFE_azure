import { StateCard } from "@core/game/domain/entities/StateCard";
import { UseCaseCreateGame } from "@core/game/domain/useCases/UseCaseCreateGame";

describe("UseCaseCreateGame", () => {
  it("crea exactamente dos cartas por pareja y comienza en la version cero", () => {
    // El nivel representa el numero de parejas, no el numero total de cartas.
    const game = new UseCaseCreateGame().execute(4, "partida");

    expect(game.name).toBe("partida");
    expect(game.version).toBe(0);
    expect(game.cards).toHaveLength(8);
    expect(game.players).toEqual([]);
    expect(game.cards.every((item) => item.state === StateCard.FaceDown)).toBe(
      true,
    );

    // Cada valor debe aparecer dos veces aunque el mazo se baraje aleatoriamente.
    const repetitions = game.cards.reduce<Record<number, number>>(
      (result, item) => ({
        ...result,
        [item.value]: (result[item.value] ?? 0) + 1,
      }),
      {},
    );
    expect(Object.values(repetitions)).toEqual([2, 2, 2, 2]);
    expect(new Set(game.cards.map((item) => item.id)).size).toBe(8);
  });
});

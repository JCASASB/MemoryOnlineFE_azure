import { ApplicationCheckCards } from "@core/game/application/ApplicationCheckCards";
import { Card } from "@core/game/domain/entities/Card";
import { Game } from "@core/game/domain/entities/Game";
import { Player } from "@core/game/domain/entities/Player";
import { StateCard } from "@core/game/domain/entities/StateCard";
import { UseCaseCheckCards } from "@core/game/domain/useCases/UseCaseCheckCards";
import { createHub, createRepository } from "../../application/fixtures";

describe("ApplicationCheckCards", () => {
  it("comprueba una pareja, guarda el resultado y devuelve la nueva version", async () => {
    // Solo cuando el caso de uso produce un estado se debe escribir y publicar una actualizacion.
    const hub = createHub();
    const repository = createRepository();
    repository.getGameFromVersion.mockResolvedValue(
      new Game(
        "game-1",
        "partida",
        1,
        7,
        [
          new Card("card-1", 1, "img_1", StateCard.FaceUp),
          new Card("card-2", 1, "img_1", StateCard.FaceUp),
        ],
        [new Player("player-1", "Ana", 0, 0, 2, 0, true, [])],
      ),
    );
    const application = new ApplicationCheckCards(
      hub,
      repository,
      new UseCaseCheckCards(),
    );

    await expect(application.execute(7)).resolves.toBe(8);
    expect(repository.saveStateToQueue).toHaveBeenCalledWith(
      expect.objectContaining({ version: 8 }),
    );
    expect(hub.sendUpdateStateGame).toHaveBeenCalledWith(
      expect.objectContaining({ version: 8 }),
      "match-1",
    );
  });
});

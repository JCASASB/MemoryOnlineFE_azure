import { ApplicationJoinGameByMatchId } from "@core/game/application/ApplicationJoinGameByMatchId";
import { Card } from "@core/game/domain/entities/Card";
import { Game } from "@core/game/domain/entities/Game";
import { UseCaseJoinMatch } from "@core/game/domain/useCases/UseCaseJoinMatch";
import { createHub, createRepository } from "../../application/fixtures";

describe("ApplicationJoinGameByMatchId", () => {
  it("carga el historial, incorpora al jugador y publica el estado al unirse", async () => {
    // El orden de llamadas protege la partida anterior y reconstruye primero la cola local.
    const hub = createHub();
    const repository = createRepository();
    const serverGame = new Game(
      "game-1",
      "partida",
      1,
      3,
      [new Card("card-1", 1, "img_1")],
    );
    hub.getServerStatesFromVersion.mockResolvedValue([serverGame]);
    repository.getLastStateFromQueue.mockResolvedValue(serverGame);
    const application = new ApplicationJoinGameByMatchId(
      hub,
      repository,
      new UseCaseJoinMatch(),
    );

    await application.execute("match-1", "Ana", "player-1");

    expect(repository.clearMatch).toHaveBeenCalledTimes(1);
    expect(repository.setMatchId).toHaveBeenCalledWith("match-1");
    expect(repository.addStatesToTheQueue).toHaveBeenCalledWith([serverGame]);
    expect(repository.saveStateToQueue).toHaveBeenCalledWith(
      expect.objectContaining({ version: 4 }),
    );
    expect(hub.sendJoinGame).toHaveBeenCalledWith("match-1");
    expect(hub.sendUpdateStateGame).toHaveBeenCalledWith(
      expect.objectContaining({ version: 4 }),
      "match-1",
    );
  });
});

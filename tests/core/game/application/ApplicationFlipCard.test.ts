import { ApplicationFlipCard } from "@core/game/application/ApplicationFlipCard";
import { UseCaseFlipCard } from "@core/game/domain/useCases/UseCaseFlipCard";
import {
  activeGame,
  createHub,
  createRepository,
} from "../../application/fixtures";

describe("ApplicationFlipCard", () => {
  it("guarda y publica el nuevo estado al girar una carta valida", async () => {
    // La cola local se actualiza antes de publicar el cambio a los demas jugadores.
    const hub = createHub();
    const repository = createRepository();
    repository.getLastStateFromQueue.mockResolvedValue(activeGame());
    const application = new ApplicationFlipCard(
      hub,
      repository,
      new UseCaseFlipCard(),
    );

    const version = await application.execute("card-1", "player-1");

    expect(version).toBe(4);
    expect(repository.saveStateToQueue).toHaveBeenCalledWith(
      expect.objectContaining({ version: 4 }),
    );
    expect(hub.sendUpdateStateGame).toHaveBeenCalledWith(
      expect.objectContaining({ version: 4 }),
      "match-1",
    );
  });

  it("informa de forma clara cuando no existe estado o jugador", async () => {
    // Estos errores evitan que un evento incompleto genere estados inconsistentes.
    const hub = createHub();
    const repository = createRepository();
    const application = new ApplicationFlipCard(
      hub,
      repository,
      new UseCaseFlipCard(),
    );

    repository.getLastStateFromQueue.mockResolvedValueOnce(undefined);
    await expect(application.execute("card-1", "player-1")).rejects.toThrow(
      "Game state not found",
    );

    repository.getLastStateFromQueue.mockResolvedValueOnce(activeGame());
    await expect(application.execute("card-1", "missing")).rejects.toThrow(
      "Player with id missing not found in game state",
    );
    expect(hub.sendUpdateStateGame).not.toHaveBeenCalled();
  });
});

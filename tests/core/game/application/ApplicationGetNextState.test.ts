import { ApplicationGetNextState } from "@core/game/application/ApplicationGetNextState";
import { activeGame, createRepository } from "../../application/fixtures";

describe("ApplicationGetNextState", () => {
  it("delega la navegacion al siguiente estado en el repositorio", async () => {
    // Este servicio es un adaptador fino y debe devolver exactamente el estado del repositorio.
    const repository = createRepository();
    const game = activeGame();
    repository.goToNextVersionState.mockResolvedValue(game);

    await expect(new ApplicationGetNextState(repository).execute()).resolves.toBe(
      game,
    );
    expect(repository.goToNextVersionState).toHaveBeenCalledTimes(1);
  });
});

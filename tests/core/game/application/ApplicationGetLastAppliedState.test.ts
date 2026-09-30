import { ApplicationGetLastAppliedState } from "@core/game/application/ApplicationGetLastAppliedState";
import { activeGame, createRepository } from "../../application/fixtures";

describe("ApplicationGetLastAppliedState", () => {
  it("delega la consulta del ultimo estado aplicado en el repositorio", async () => {
    // El resultado debe conservar la misma instancia entregada por el repositorio.
    const repository = createRepository();
    const game = activeGame();
    repository.goToLastAppliedState.mockResolvedValue(game);

    await expect(
      new ApplicationGetLastAppliedState(repository).execute(),
    ).resolves.toBe(game);
    expect(repository.goToLastAppliedState).toHaveBeenCalledTimes(1);
  });
});

import { ApplicationAnimationInProgressRemove } from "@core/game/application/ApplicationAnimationInProgresRemove";
import { createRepository } from "../../application/fixtures";

describe("ApplicationAnimationInProgressRemove", () => {
  it("normaliza una o varias cartas antes de delegar en el repositorio", async () => {
    // Tanto un array como un identificador individual deben llegar como una lista.
    const repository = createRepository();
    const application = new ApplicationAnimationInProgressRemove(repository);

    await application.execute(["card-1", "card-2"]);
    await application.execute("card-3");

    expect(repository.removeAnimationInProgress).toHaveBeenNthCalledWith(1, [
      "card-1",
      "card-2",
    ]);
    expect(repository.removeAnimationInProgress).toHaveBeenNthCalledWith(2, [
      "card-3",
    ]);
  });
});

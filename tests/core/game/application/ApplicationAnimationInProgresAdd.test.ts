import { ApplicationAnimationInProgressAdd } from "@core/game/application/ApplicationAnimationInProgresAdd";
import { createRepository } from "../../application/fixtures";

describe("ApplicationAnimationInProgressAdd", () => {
  it("delega la incorporacion de una animacion en el repositorio", async () => {
    // La aplicacion debe pasar sin modificar el identificador de la carta.
    const repository = createRepository();

    await new ApplicationAnimationInProgressAdd(repository).execute("card-1");

    expect(repository.addAnimationInProgress).toHaveBeenCalledWith("card-1");
  });
});

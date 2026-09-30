import { ApplicationCreateMatch } from "@core/game/application/ApplicationCreateMatch";
import { UseCaseCreateGame } from "@core/game/domain/useCases/UseCaseCreateGame";
import { createHub } from "../../application/fixtures";

describe("ApplicationCreateMatch", () => {
  it("crea la partida y espera a que SignalR confirme el envio", async () => {
    // El objeto devuelto debe ser exactamente el mismo que se entrega al puerto de salida.
    const hub = createHub();
    const application = new ApplicationCreateMatch(
      hub,
      new UseCaseCreateGame(),
    );

    const result = await application.execute(2, "partida");

    expect(hub.sendCreateGame).toHaveBeenCalledWith(result);
    expect(result).toMatchObject({ name: "partida", level: 2, version: 0 });
  });
});

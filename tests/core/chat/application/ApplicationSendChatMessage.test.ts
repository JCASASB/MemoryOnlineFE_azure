import { ApplicationSendChatMessage } from "@core/chat/application/ApplicationSendChatMessage";
import { UseCaseSendChatMessage } from "@core/chat/domain/useCases/UseCaseSendChatMessage";
import { createHub } from "../../application/fixtures";

describe("ApplicationSendChatMessage", () => {
  it("sanea y envia el mensaje construido por el caso de uso", async () => {
    // Se verifica la frontera de salida: la aplicacion debe enviar al hub el mensaje de dominio.
    const hub = createHub();
    const application = new ApplicationSendChatMessage(
      hub,
      new UseCaseSendChatMessage(),
    );

    await application.execute("  hola  ", "  Ana  ", "player-1");

    expect(hub.sendChatMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "hola",
        playerName: "Ana",
        playerId: "player-1",
      }),
    );
  });

  it("no envia mensajes cuando falta el nombre del jugador", async () => {
    // Un nombre solo con espacios debe fallar antes de comunicarse con SignalR.
    const hub = createHub();
    const application = new ApplicationSendChatMessage(
      hub,
      new UseCaseSendChatMessage(),
    );

    await expect(
      application.execute("hola", "   ", "player-1"),
    ).rejects.toThrow("No se encontro el nombre del jugador.");
    expect(hub.sendChatMessage).not.toHaveBeenCalled();
  });
});

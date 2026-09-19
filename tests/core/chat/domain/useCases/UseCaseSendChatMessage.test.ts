import { UseCaseSendChatMessage } from "@core/chat/domain/useCases/UseCaseSendChatMessage";

describe("UseCaseSendChatMessage", () => {
  it("crea un mensaje saneado con identificador y fecha UTC", () => {
    // Los espacios externos no deben viajar al servidor ni guardarse en el mensaje.
    const before = new Date().toISOString();
    const result = new UseCaseSendChatMessage().execute(
      "  hola equipo  ",
      "  Ana  ",
      "player-1",
    );
    const after = new Date().toISOString();

    expect(result).toMatchObject({
      message: "hola equipo",
      playerName: "Ana",
      playerId: "player-1",
    });
    expect(result.id).toEqual(expect.any(String));
    expect(result.sentAtUtc >= before).toBe(true);
    expect(result.sentAtUtc <= after).toBe(true);
  });

  it("rechaza mensajes vacios aunque contengan espacios", () => {
    // El trim forma parte de la regla de negocio y evita enviar mensajes visualmente vacios.
    expect(() =>
      new UseCaseSendChatMessage().execute("   ", "Ana", "player-1"),
    ).toThrow("El mensaje no puede estar vacio.");
  });
});

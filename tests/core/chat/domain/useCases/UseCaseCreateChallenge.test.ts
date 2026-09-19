import { UseCaseCreateChallenge } from "@core/chat/domain/useCases/UseCaseCreateChallenge";

describe("UseCaseCreateChallenge", () => {
  it("crea un desafio con los participantes y la partida indicados", () => {
    // Los nombres se completan posteriormente; aqui solo se construye la solicitud inicial.
    const result = new UseCaseCreateChallenge().execute(
      "match-1",
      "player-1",
      "player-2",
    );

    expect(result).toMatchObject({
      matchId: "match-1",
      player1Id: "player-1",
      player1Name: "",
      player2Id: "player-2",
      player2Name: "",
    });
    expect(result.id).toEqual(expect.any(String));
  });
});

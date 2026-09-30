import { ApplicationCreateChallenge } from "@core/chat/application/ApplicationCreateChallenge";
import { UseCaseCreateChallenge } from "@core/chat/domain/useCases/UseCaseCreateChallenge";
import { createHub } from "../../application/fixtures";

describe("ApplicationCreateChallenge", () => {
  it("envia al servidor el desafio creado", async () => {
    // La capa de aplicacion coordina el caso de uso sin reconstruir el objeto resultante.
    const hub = createHub();
    const application = new ApplicationCreateChallenge(
      hub,
      new UseCaseCreateChallenge(),
    );

    await application.execute("match-1", "player-1", "player-2");

    expect(hub.createChallengeToServer).toHaveBeenCalledWith(
      expect.objectContaining({
        matchId: "match-1",
        player1Id: "player-1",
        player2Id: "player-2",
      }),
    );
  });
});

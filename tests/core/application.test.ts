import type { ApplicationHubPort } from "@core/domain/ports/GameHubPort";
import { ApplicationCreateChallenge } from "@core/chat/application/ApplicationCreateChallenge";
import { ApplicationSendChatMessage } from "@core/chat/application/ApplicationSendChatMessage";
import { UseCaseCreateChallenge } from "@core/chat/domain/useCases/UseCaseCreateChallenge";
import { UseCaseSendChatMessage } from "@core/chat/domain/useCases/UseCaseSendChatMessage";
import { ApplicationAnimationInProgressAdd } from "@core/game/application/ApplicationAnimationInProgresAdd";
import { ApplicationAnimationInProgressRemove } from "@core/game/application/ApplicationAnimationInProgresRemove";
import { ApplicationCheckCards } from "@core/game/application/ApplicationCheckCards";
import { ApplicationCreateMatch } from "@core/game/application/ApplicationCreateMatch";
import { ApplicationFlipCard } from "@core/game/application/ApplicationFlipCard";
import { ApplicationGetLastAppliedState } from "@core/game/application/ApplicationGetLastAppliedState";
import { ApplicationGetNextState } from "@core/game/application/ApplicationGetNextState";
import { ApplicationJoinGameByMatchId } from "@core/game/application/ApplicationJoinGameByMatchId";
import { Card } from "@core/game/domain/entities/Card";
import { Game } from "@core/game/domain/entities/Game";
import { Player } from "@core/game/domain/entities/Player";
import { StateCard } from "@core/game/domain/entities/StateCard";
import { UseCaseCheckCards } from "@core/game/domain/useCases/UseCaseCheckCards";
import { UseCaseCreateGame } from "@core/game/domain/useCases/UseCaseCreateGame";
import { UseCaseFlipCard } from "@core/game/domain/useCases/UseCaseFlipCard";
import { UseCaseJoinMatch } from "@core/game/domain/useCases/UseCaseJoinMatch";
import type { GameRepositoryType } from "@core/game/repository/GameRepositoryType";

const createHub = (): jest.Mocked<ApplicationHubPort> => ({
  sendUpdateStateGame: jest.fn().mockResolvedValue(undefined),
  sendCreateGame: jest.fn().mockResolvedValue(undefined),
  sendJoinGame: jest.fn().mockResolvedValue(undefined),
  getMatchIdFromServer: jest.fn(),
  getServerStatesFromVersion: jest.fn(),
  sendChatMessage: jest.fn().mockResolvedValue(undefined),
  createChallengeToServer: jest.fn().mockResolvedValue(undefined),
  registerUpdateStatesCallback: jest.fn(),
  registerChallengeReceivedCallback: jest.fn(),
  registerStatusChangedCallback: jest.fn(),
  registerChatMessagesReceivedCallback: jest.fn(),
  getStatus: jest.fn(),
  disconnect: jest.fn().mockResolvedValue(undefined),
});

const createRepository = (): jest.Mocked<GameRepositoryType> => ({
  saveStateToQueue: jest.fn(),
  processStateFromQueue: jest.fn(),
  addStatesToTheQueue: jest.fn(),
  getLastStateFromQueue: jest.fn(),
  goToNextVersionState: jest.fn(),
  goToLastAppliedState: jest.fn(),
  getGameFromVersion: jest.fn(),
  subscribeToVersion: jest.fn(),
  removeAnimationInProgress: jest.fn(),
  addAnimationInProgress: jest.fn(),
  areAnimationsInProgress: jest.fn(),
  clearAll: jest.fn().mockResolvedValue(undefined),
  clearMatch: jest.fn().mockResolvedValue(undefined),
  savePlayerName: jest.fn(),
  getPlayerName: jest.fn(),
  setMatchId: jest.fn().mockResolvedValue(undefined),
  savePlayerId: jest.fn(),
  getPlayerId: jest.fn(),
  getMatchId: jest.fn().mockResolvedValue("match-1"),
  getChallenges: jest.fn(),
  subscribeToChallenges: jest.fn(),
});

const activeGame = (): Game =>
  new Game(
    "game-1",
    "partida",
    1,
    3,
    [new Card("card-1", 1, "img_1")],
    [new Player("player-1", "Ana", 0, 2, 0, 0, true)],
  );

describe("servicios de aplicacion de core", () => {
  describe("chat", () => {
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

  describe("partida", () => {
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

    it("carga el historial, incorpora al jugador y publica el estado al unirse", async () => {
      // El orden de llamadas protege la partida anterior y reconstruye primero la cola local.
      const hub = createHub();
      const repository = createRepository();
      const serverGame = new Game(
        "game-1",
        "partida",
        1,
        3,
        [new Card("card-1", 1, "img_1")],
      );
      hub.getServerStatesFromVersion.mockResolvedValue([serverGame]);
      repository.getLastStateFromQueue.mockResolvedValue(serverGame);
      const application = new ApplicationJoinGameByMatchId(
        hub,
        repository,
        new UseCaseJoinMatch(),
      );

      await application.execute("match-1", "Ana", "player-1");

      expect(repository.clearMatch).toHaveBeenCalledTimes(1);
      expect(repository.setMatchId).toHaveBeenCalledWith("match-1");
      expect(repository.addStatesToTheQueue).toHaveBeenCalledWith([serverGame]);
      expect(repository.saveStateToQueue).toHaveBeenCalledWith(
        expect.objectContaining({ version: 4 }),
      );
      expect(hub.sendJoinGame).toHaveBeenCalledWith("match-1");
      expect(hub.sendUpdateStateGame).toHaveBeenCalledWith(
        expect.objectContaining({ version: 4 }),
        "match-1",
      );
    });

    it("comprueba una pareja, guarda el resultado y devuelve la nueva version", async () => {
      // Solo cuando el caso de uso produce un estado se debe escribir y publicar una actualizacion.
      const hub = createHub();
      const repository = createRepository();
      repository.getGameFromVersion.mockResolvedValue(
        new Game(
          "game-1",
          "partida",
          1,
          7,
          [
            new Card("card-1", 1, "img_1", StateCard.FaceUp),
            new Card("card-2", 1, "img_1", StateCard.FaceUp),
          ],
          [new Player("player-1", "Ana", 0, 0, 2, 0, true)],
        ),
      );
      const application = new ApplicationCheckCards(
        hub,
        repository,
        new UseCaseCheckCards(),
      );

      await expect(application.execute(7)).resolves.toBe(8);
      expect(repository.saveStateToQueue).toHaveBeenCalledWith(
        expect.objectContaining({ version: 8 }),
      );
      expect(hub.sendUpdateStateGame).toHaveBeenCalledWith(
        expect.objectContaining({ version: 8 }),
        "match-1",
      );
    });

    it("delega navegacion de estados y control de animaciones en el repositorio", async () => {
      // Estos servicios son adaptadores finos; el test garantiza el formato exacto de la delegacion.
      const repository = createRepository();
      const game = activeGame();
      repository.goToNextVersionState.mockResolvedValue(game);
      repository.goToLastAppliedState.mockResolvedValue(game);

      await expect(
        new ApplicationGetNextState(repository).execute(),
      ).resolves.toBe(game);
      await expect(
        new ApplicationGetLastAppliedState(repository).execute(),
      ).resolves.toBe(game);
      await new ApplicationAnimationInProgressAdd(repository).execute("card-1");
      await new ApplicationAnimationInProgressRemove(repository).execute([
        "card-1",
        "card-2",
      ]);
      await new ApplicationAnimationInProgressRemove(repository).execute(
        "card-3",
      );

      expect(repository.addAnimationInProgress).toHaveBeenCalledWith("card-1");
      expect(repository.removeAnimationInProgress).toHaveBeenNthCalledWith(1, [
        "card-1",
        "card-2",
      ]);
      expect(repository.removeAnimationInProgress).toHaveBeenNthCalledWith(2, [
        "card-3",
      ]);
    });
  });
});

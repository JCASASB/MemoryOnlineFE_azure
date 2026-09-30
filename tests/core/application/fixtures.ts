import type { ApplicationHubPort } from "@core/domain/ports/GameHubPort";
import { Card } from "@core/game/domain/entities/Card";
import { Game } from "@core/game/domain/entities/Game";
import { Player } from "@core/game/domain/entities/Player";
import type { GameRepositoryType } from "@core/game/repository/GameRepositoryType";

export const createHub = (): jest.Mocked<ApplicationHubPort> => ({
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

export const createRepository = (): jest.Mocked<GameRepositoryType> => ({
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

export const activeGame = (): Game =>
  new Game(
    "game-1",
    "partida",
    1,
    3,
    [new Card("card-1", 1, "img_1")],
    [new Player("player-1", "Ana", 0, 2, 0, 0, true, [])],
  );

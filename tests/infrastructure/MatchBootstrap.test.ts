import { OnlineMemoryGameRepository } from "../../src/infrastructure/repositories/OnlineMemoryGameRepository";
import { db } from "../../src/infrastructure/repositories/GameDatabase";

jest.mock("../../src/infrastructure/repositories/GameDatabase", () => ({
  db: {
    getMatchId: jest.fn(),
    getAppliedVersion: jest.fn(),
    getGame: jest.fn(),
    setAppliedVersion: jest.fn(),
    games: { where: jest.fn() },
  },
}));
jest.mock("../../src/infrastructure/signalr/SignalRGameHub", () => ({
  SignalRGameHub: {
    getInstance: () => ({
      registerUpdateStatesCallback: jest.fn(),
      registerChallengeReceivedCallback: jest.fn(),
    }),
  },
}));

describe("Bootstrap of the current match", () => {
  beforeEach(() => jest.clearAllMocks());

  it("loads the first available version when the saved version is absent", async () => {
    const repository = new OnlineMemoryGameRepository();
    jest.mocked(db.getMatchId).mockResolvedValue("new-match");
    jest.mocked(db.getAppliedVersion).mockResolvedValue(0);
    const state = { version: 5 } as Awaited<ReturnType<typeof db.getGame>>;
    jest.mocked(db.getGame).mockResolvedValueOnce(undefined).mockResolvedValueOnce(state);
    const sortBy = jest.fn().mockResolvedValue([{ version: 5 }]);
    jest.mocked(db.games.where).mockReturnValue({ equals: jest.fn().mockReturnValue({ sortBy }) } as never);

    await expect(repository.goToLastAppliedState()).resolves.toBe(state);
    expect(db.games.where).toHaveBeenCalledWith("idMatch");
    expect(sortBy).toHaveBeenCalledWith("version");
    expect(db.getGame).toHaveBeenLastCalledWith("new-match", 5);
    expect(db.setAppliedVersion).toHaveBeenCalledWith(5, "new-match");
  });

  it("restores version zero without skipping it", async () => {
    const repository = new OnlineMemoryGameRepository();
    jest.mocked(db.getMatchId).mockResolvedValue("match");
    jest.mocked(db.getAppliedVersion).mockResolvedValue(0);
    const state = { version: 0 } as Awaited<ReturnType<typeof db.getGame>>;
    jest.mocked(db.getGame).mockResolvedValue(state);
    await expect(repository.goToLastAppliedState()).resolves.toBe(state);
    expect(db.games.where).not.toHaveBeenCalled();
  });

  it("keeps the version unchanged while a card is animating", async () => {
    const repository = new OnlineMemoryGameRepository();
    repository.addAnimationInProgress("card");
    await expect(repository.goToLastAppliedState()).resolves.toBeUndefined();
    expect(db.getAppliedVersion).not.toHaveBeenCalled();
  });
});

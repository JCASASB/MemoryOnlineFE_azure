import { GameDatabase } from "../../src/infrastructure/repositories/GameDatabase";

jest.mock("dexie", () => ({
  __esModule: true,
  default: class {
    settings = {
      rows: new Map<string, { key: string; value: unknown }>(),
      put: async (row: { key: string; value: unknown }) => { this.settings.rows.set(row.key, row); },
      get: async (key: string) => this.settings.rows.get(key),
    };
    version() {
      return { stores: () => {
        const rows = new Map<string, { key: string; value: unknown }>();
        this.settings = {
          rows,
          put: async row => { rows.set(row.key, row); },
          get: async key => rows.get(key),
        };
        return this;
      } };
    }
    async open() {}
  },
}));

describe("Saved versions are isolated per match", () => {
  it("does not inherit another match's applied version", async () => {
    const database = new GameDatabase();
    await database.setMatchId("a");
    await database.setAppliedVersion(23);
    await database.setMatchId("b");
    await expect(database.getAppliedVersion()).resolves.toBe(0);
    await database.setAppliedVersion(4);
    await expect(database.getAppliedVersion("a")).resolves.toBe(23);
    await expect(database.getAppliedVersion("b")).resolves.toBe(4);
  });
  it("ignores the unscoped legacy cursor without deleting data", async () => {
    const database = new GameDatabase();
    await database.settings.put({ key: "gameVersionApplied", value: 99 });
    await database.setMatchId("new");
    await expect(database.getAppliedVersion()).resolves.toBe(0);
    await expect(database.settings.get("gameVersionApplied")).resolves.toEqual({ key: "gameVersionApplied", value: 99 });
  });
  it("writes to the captured match if the active match changes meanwhile", async () => {
    const database = new GameDatabase();
    await database.setMatchId("b");
    await database.setAppliedVersion(7, "a");
    await expect(database.getAppliedVersion("a")).resolves.toBe(7);
    await expect(database.getAppliedVersion("b")).resolves.toBe(0);
  });
});

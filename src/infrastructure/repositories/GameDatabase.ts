import Dexie, { type Table } from "dexie";
import type { Game } from "../../core/game/domain/entities/Game";
import { StateCard } from "../../core/game/domain/entities/StateCard";

export class GameDatabase extends Dexie {
  // Cambiamos a 'any' o a una interfaz que acepte tu nueva estructura
  games!: Table<any, [string, number]>;
  // Definimos la nueva tabla
  settings!: Table<{ key: string; value: any; }, string>;

  constructor() {
    super("GameDatabase");

    // Subimos a versión 4 para incluir la nueva tabla
    this.version(4).stores({
      games: "[idMatch+version], idMatch, version",
      settings: "key", // 'key' será el identificador (ej: 'gameVersionApplied')
    });
  }

  /**
   * Guarda la versión aplicada
   */
  async setAppliedVersion(version: number, matchId: string): Promise<void> {
    await this.settings.put({ key: "gameVersionApplied:" + matchId, value: version });
  }

  /**
   * Obtiene la versión aplicada (devuelve 0 si no existe)
   */
  async getAppliedVersion(matchId: string): Promise<number> {
    const setting = await this.settings.get("gameVersionApplied:" + matchId);
    return setting ? setting.value : 0;
  }

  async setMatchId(matchId: string): Promise<void> {
    await this.settings.put({ key: "matchId", value: matchId });
  }

  /**
   * Obtiene la versión aplicada (devuelve 0 si no existe)
   */
  async getMatchId(): Promise<string | undefined> {
    const setting = await this.settings.get("matchId");
    return setting ? setting.value : undefined;
  }

  async saveGame(idMatch: string, game: Game): Promise<void> {
    try {
      // Usamos 'put' con la estructura que definiste
      await this.games.put({
        idMatch: idMatch,
        version: game.version,
        // Guardamos el objeto Game original aquí
        stateBoard: game,
      });
    } catch (error) {
      console.error("Error al guardar en IndexedDB:", error);
      throw error;
    }
  }

  async saveGames(idMatch: string, games: Game[]): Promise<void> {
    try {
      // Usamos 'bulkPut' con la estructura que definiste
      const items = games.map((game) => ({
        idMatch: idMatch,
        version: game.version,
        stateBoard: game,
      }));
      await this.games.bulkPut(items);
    } catch (error) {
      console.error("Error al guardar varios en IndexedDB:", error);
      throw error;
    }
  }

  // IMPORTANTE: Para recuperar el juego luego
  async getGame(idMatch: string, version: number): Promise<Game | undefined> {
    const record = await this.games.get([idMatch, version]);
    const raw = record?.stateBoard;
    if (!raw) return undefined;
    return this.normalizeGame(raw);
  }

  /**
   * Obtiene el estado con la versión más alta para un idMatch específico.
   */
  async getLastState(idMatch: string): Promise<Game | undefined> {
    try {
      // 1. Buscamos en el índice 'idMatch'
      // 2. Ordenamos en reversa (la versión más alta primero)
      // 3. Tomamos el primer registro
      const lastRecord = await this.games
        .where("idMatch")
        .equals(idMatch)
        .reverse()
        .sortBy("version")
        .then((results) => results[0]);

      if (!lastRecord) return undefined;

      const raw = lastRecord.stateBoard || lastRecord;
      return this.normalizeGame(raw);
    } catch (error) {
      console.error("Error al obtener el último estado:", error);
      return undefined;
    }
  }

  private normalizeGame(raw: any): Game {
    // Ensure cards' state values are numeric StateCard
    const cards = Array.isArray(raw.cards)
      ? raw.cards.map((c: any) => ({
        ...c,
        state: this.toStateCard(c.state) ?? StateCard.FaceDown,
      }))
      : [];

    return {
      ...raw,
      cards,
      version: Number(raw.version ?? 0),
    } as Game;
  }

  private toStateCard(val: unknown): StateCard | undefined {
    if (typeof val === "number") {
      if (
        val === StateCard.FaceDown ||
        val === StateCard.FaceUp ||
        val === StateCard.Matched
      )
        return val as StateCard;
      return undefined;
    }
    if (typeof val === "string") {
      const num = Number(val);
      if (!Number.isNaN(num)) {
        if (
          num === StateCard.FaceDown ||
          num === StateCard.FaceUp ||
          num === StateCard.Matched
        )
          return num as StateCard;
      }
      const enumVal = (StateCard as any)[val as keyof typeof StateCard];
      if (typeof enumVal === "number") return enumVal as StateCard;
    }
    return undefined;
  }
}

export let db = new GameDatabase();

// Try to open DB immediately and handle incompatible schema changes (changing primary key)
(async () => {
  try {
    await db.open();
  } catch (err: any) {
    console.error("Failed to open IndexedDB:", err);
    const message = err?.message || "";
    const isPrimaryKeyChange =
      err?.name === "UpgradeError" ||
      /change.*primary key/i.test(message) ||
      /changing primary key/i.test(message);

    if (isPrimaryKeyChange) {
      console.warn(
        "Incompatible DB schema change detected (primary key changed). Deleting database and recreating. This will remove existing IndexedDB data.",
      );

      try {
        await Dexie.delete(db.name);
        const recreated = new GameDatabase();
        await recreated.open();
        db = recreated;
        console.info(
          "Recreated GameDatabase after deleting incompatible schema.",
        );
        if (typeof window !== "undefined") {
          // Reload so the rest of the app picks up the recreated DB state.
          window.location.reload();
        }
      } catch (e) {
        console.error("Failed to delete/recreate IndexedDB:", e);
      }
    } else {
      throw err;
    }
  }
})();

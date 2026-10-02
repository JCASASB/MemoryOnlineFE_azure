import type { Game } from "../../core/game/domain/entities/Game";
import type { GameRepositoryType } from "../../core/game/repository/GameRepositoryType";
import { Challenge } from "../../core/chat/domain/entities/Challenge";
import { SignalRGameHub } from "../signalr/SignalRGameHub";
import { db } from "./GameDatabase";

export class OnlineMemoryGameRepository implements GameRepositoryType {
  // Suscriptores nativos de la capa UI (React)
  private versionSubscribers: Array<() => void> = [];
  private challengeSubscribers: Array<(challenge: Challenge) => void> = [];

  private animationsInProgress: string[] = [];
  private challenges: Challenge[] = [];

  readonly PLAYER_ID_KEY = "playerId";
  readonly PLAYER_NAME_KEY = "playerName";

  constructor() {
    const hub = SignalRGameHub.getInstance();

    // El repositorio se engancha de forma reactiva al Hub global perpetuo.
    // Reaccionará de inmediato en cuanto el Hub se conecte tras el Login.
    hub.registerUpdateStatesCallback((games: Game[]) => {
      games.forEach((game) => void this.saveStateToQueue(game));
    });

    hub.registerChallengeReceivedCallback((payload: Challenge) => {
      this.challenges = [...this.challenges, payload];
      this.challengeSubscribers.forEach((cb) => cb(payload));
    });
  }

  getPlayerId(): string {
    return localStorage.getItem(this.PLAYER_ID_KEY) ?? "";
  }
  savePlayerId(id: string) {
    localStorage.setItem(this.PLAYER_ID_KEY, id);
  }
  savePlayerName(name: string) {
    localStorage.setItem(this.PLAYER_NAME_KEY, name);
  }
  getPlayerName(): string {
    return localStorage.getItem(this.PLAYER_NAME_KEY) ?? "";
  }

  async clearMatch(): Promise<void> {
    await db.games.clear();
    await db.settings.clear();
    this.animationsInProgress = [];
    localStorage.removeItem("currentVersionGame");
  }

  async clearAll(): Promise<void> {
    await this.clearMatch();
    this.challenges = [];
    localStorage.removeItem("auth-jbearer-token");
  }

  // ─── Gestión de Estados Locales ─────────────────────────────
  async getLastStateFromQueue(): Promise<Game | undefined> {
    const matchId = await this.getMatchId();
    return await db.getLastState(matchId);
  }

  async goToNextVersionState(): Promise<Game | undefined> {
    if (!this.areAnimationsInProgress()) {
      const matchId = await db.getMatchId();
      if (!matchId) throw new Error("Match ID not found");

      const versionApplied = await db.getAppliedVersion(matchId);
      return this.goToVersionState(versionApplied + 1);
    }
    return undefined;
  }

  async goToLastAppliedState(): Promise<Game | undefined> {
    if (!this.areAnimationsInProgress()) {
      const matchId = await this.getMatchId();

      const versionApplied = await db.getAppliedVersion(matchId);
      const applied = await this.goToVersionState(versionApplied);
      if (applied) return applied;
    }
    return undefined;
  }

  async goToVersionState(stateVersion: number): Promise<Game | undefined> {
    const matchId = await this.getMatchId();
    const stored = await db.getGame(matchId, stateVersion);
    if (stored) {
      await db.setAppliedVersion(stored.version, matchId);
      return stored;
    }
    return undefined;
  }

  async getGameFromVersion(stateVersion: number): Promise<Game | undefined> {
    const matchId = await this.getMatchId();
    return await db.getGame(matchId, stateVersion);
  }

  async saveStateToQueue(state: Game): Promise<void> {
    const matchId = await this.getMatchId();
    await db.saveGame(matchId, state);
  }

  async processStateFromQueue(): Promise<Game | undefined> {
    if (!this.areAnimationsInProgress()) {
      const matchId = await db.getMatchId();
      if (!matchId) throw new Error("Match ID not found");

      const version = await db.getAppliedVersion(matchId);

      const record = await db.getGame(matchId, version + 1);
      if (!record)
        throw new Error("No state found in queue for version: " + version);

      this.setCurrentVersionGame(record.version);
      return record;
    }
    return undefined;
  }

  // ─── Suscripciones para la UI (React) ──────────────────────
  subscribeToVersion = (callback: () => void): (() => void) => {
    this.versionSubscribers.push(callback);
    return () => {
      this.versionSubscribers = this.versionSubscribers.filter(
        (cb) => cb !== callback,
      );
    };
  };

  getChallenges(): Challenge[] {
    return this.challenges;
  }

  subscribeToChallenges(callback: (challenge: Challenge) => void): () => void {
    this.challengeSubscribers.push(callback);
    return () => {
      this.challengeSubscribers = this.challengeSubscribers.filter(
        (cb) => cb !== callback,
      );
    };
  }

  // ─── Peticiones Pasivas al Servidor (El Hub se encarga) ─────

  // ─── Manejo de Animaciones y Helpers Locales ───────────────
  async addStatesToTheQueue(states: Game[]): Promise<void> {
    const matchId = await this.getMatchId();
    await db.saveGames(matchId, states);
  }

  async setMatchId(matchId: string): Promise<void> {
    await db.setMatchId(matchId);
  }

  async getMatchId(): Promise<string> {
    const matchId = await db.getMatchId();
    if (!matchId) throw new Error("Match ID not found");
    return matchId;
  }

  addAnimationInProgress(animationId: string): void {
    if (!this.animationsInProgress.includes(animationId))
      this.animationsInProgress.push(animationId);
  }
  removeAnimationInProgress(animationIds: string[]): void {
    this.animationsInProgress = this.animationsInProgress.filter(
      (id) => !animationIds.includes(id),
    );
  }
  areAnimationsInProgress(): boolean {
    return this.animationsInProgress.length > 0;
  }

  setAuthToken(token: string): void {
    localStorage.setItem("auth-jbearer-token", token);
  }

  getCurrentVersionGame(): number {
    const stored = localStorage.getItem("currentVersionGame");
    return stored ? Number(stored) : 0;
  }

  setCurrentVersionGame(version: number): void {
    localStorage.setItem("currentVersionGame", version.toString());
    this.versionSubscribers.forEach((cb) => cb());
  }
}

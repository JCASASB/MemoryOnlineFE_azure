import type { Challenge } from "../../../core/chat/domain/entities/Challenge";
import {
  ChallengeInfo,
  ChallengeItem,
  ChallengeLabel,
  JoinButton,
} from "./ItemChallenge.styles";

export const ItemChallenge = ({
  challenge,
  joiningId,
  handleJoin,
}: {
  challenge: Challenge;
  joiningId: string | null;
  handleJoin: (challenge: Challenge) => Promise<void>;
}) => {
  return (
    <>
      <ChallengeItem key={challenge.id}>
        <ChallengeInfo>
          <ChallengeLabel>Desafío</ChallengeLabel>
          <span>De: {challenge.player1Name}</span>
          <span>Para: {challenge.player2Name}</span>
          <span>En: {challenge.createdAt}</span>
        </ChallengeInfo>
        <JoinButton
          onClick={() => void handleJoin(challenge)}
          disabled={joiningId === challenge.id}
        >
          {joiningId === challenge.id ? "Entrando..." : "Unirse"}
        </JoinButton>
      </ChallengeItem>
    </>
  );
};

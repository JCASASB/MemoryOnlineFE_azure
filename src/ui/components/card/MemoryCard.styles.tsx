import styled from "styled-components";
import { StateCard } from "../../../core/game/domain/entities/StateCard";
import { getBackColor } from "./MemoryCard.utils";

export const CardContainer = styled.div<{
  $stateCard: StateCard;
  $isAnimating: boolean;
  $value: number;
}>`
  width: 100%;
  max-width: 160px;
  aspect-ratio: 5 / 7;
  perspective: 1000px;
  cursor: ${({ $stateCard, $isAnimating }) =>
    $stateCard === StateCard.FaceDown && !$isAnimating ? "pointer" : "default"};
  opacity: ${({ $stateCard }) => ($stateCard === StateCard.Matched ? 0.5 : 1)};

  .card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.6s;
    transform-style: preserve-3d;
    transform: ${({ $stateCard }) =>
      $stateCard === StateCard.FaceUp || $stateCard === StateCard.Matched
        ? "rotateY(180deg)"
        : "none"};
  }

  .card-front,
  .card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    border-radius: 8px;
    border: 2px solid #ccc;
  }

  .card-front {
    background: #2c3e50;
    color: white;
  }

  .card-back {
    background: ${({ $value }) => getBackColor($value)};
    transform: rotateY(180deg);
  }
`;

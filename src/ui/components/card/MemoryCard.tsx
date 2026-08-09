import { useCallback, useEffect, useRef, useState } from "react";
import whichTransitionEventF from "./extra";
import { StateCard } from "../../../core/game/domain/entities/StateCard";
import { useAnimations } from "../../hooks/useAnimations";
import { CardContainer } from "./MemoryCard.styles";
import { getSquareColor } from "./MemoryCard.utils";

interface MemoryCardProps {
  id: string;
  value: number;
  stateCard: StateCard;
  flip: (id: string) => void;
}

const renderSquares = (value: number) => {
  const squares = Array.from({ length: value }, (_, i) => i);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${Math.min(value, 3)}, 1fr)`,
        gap: 4,
        padding: 8,
      }}
    >
      {squares.map((i) => (
        <div
          key={i}
          style={{
            width: 16,
            height: 16,
            backgroundColor: getSquareColor(value),
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
};

export const MemoryCard = ({ id, value, stateCard, flip }: MemoryCardProps) => {
  const { addAnimationInProgress, removeAnimationInProgress } = useAnimations();

  const transitionEvent = whichTransitionEventF();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnimatingThisCard, setIsAnimatingThisCard] = useState(false);

  const startAnimation = useCallback(() => {
    setIsAnimatingThisCard(true);

    addAnimationInProgress(id);
  }, [addAnimationInProgress, id]);

  const finishAnimation = useCallback(() => {
    setIsAnimatingThisCard(false);
    removeAnimationInProgress(id);
  }, [removeAnimationInProgress, id]);

  const handleClick = () => {
    if (stateCard === StateCard.FaceDown && !isAnimatingThisCard) {
      flip(id);
    }
  };

  useEffect(() => {
    const node = containerRef.current;
    if (transitionEvent && node) {
      node.addEventListener("transitionstart", startAnimation as EventListener);
      node.addEventListener(transitionEvent, finishAnimation as EventListener);
    }

    return () => {
      if (transitionEvent && node) {
        node.removeEventListener(
          "transitionstart",
          startAnimation as EventListener,
        );
        node.removeEventListener(
          transitionEvent,
          finishAnimation as EventListener,
        );
      }
    };
  }, [transitionEvent, startAnimation, finishAnimation]);

  return (
    <CardContainer
      ref={containerRef}
      $stateCard={stateCard}
      $isAnimating={isAnimatingThisCard}
      $value={value}
      data-state={StateCard[stateCard]}
      onClick={handleClick}
    >
      <div className="card-inner">
        <div className="card-front">?</div>
        <div className="card-back">{renderSquares(value)}</div>
      </div>
    </CardContainer>
  );
};

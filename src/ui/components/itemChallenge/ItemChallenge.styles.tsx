import styled from "styled-components";

export const ChallengeItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-radius: 10px;
  border: 2px solid #ddd;
  background: #fafafa;
`;

export const ChallengeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.9rem;
`;

export const ChallengeLabel = styled.span`
  font-weight: 700;
  font-size: 1rem;
`;

export const JoinButton = styled.button`
  padding: 10px 22px;
  border-radius: 8px;
  border: none;
  background: #333;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #555;
  }

  &:disabled {
    background: #aaa;
    cursor: not-allowed;
  }
`;

import styled from "styled-components";

export const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: clamp(360px, 62vh, 760px);
  margin-top: 16px;
  border-radius: 16px;
  touch-action: none;
  outline-offset: 4px;
`;
export const KeyboardCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
  gap: 8px;
  margin-top: 12px;
  button { min-height: 44px; cursor: pointer; }
`;

import { useConnectionStatus } from "../../hooks/useConnectionStatus";
import {
  StatusContainer,
  StatusCode,
  StatusWrapper,
} from "./ConnectionStatus.styles";

export const ConnectionStatus = () => {
  const connectionStatus = useConnectionStatus();

  const color =
    connectionStatus === 2
      ? "#28a745"
      : connectionStatus === 1 || connectionStatus === 4
        ? "#ffc107"
        : "#dc3545";

  return (
    <StatusContainer>
      <StatusWrapper>
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <circle cx="6" cy="6" r="6" fill={color} />
        </svg>
        <StatusCode>{connectionStatus}</StatusCode>
      </StatusWrapper>
    </StatusContainer>
  );
};

import { useEffect, useState } from "react";
import { AppRoutes } from "../../pages/layout/AppRoutes";
import { useDependencies } from "../../context/useDependencies";
import { Badge, BadgeContainer } from "./BadgeNewChatMessage.styles";

export const BadgeNewChatMessage = ({ location }: { location: string }) => {
  const isActiveTabChat = location === AppRoutes.chat;
  const { chatRepository } = useDependencies();
  const [isNewChatMessage, setIsNewChatMessage] = useState(false);

  // 1. Único efecto: Escucha el repositorio externo (Práctica recomendada por React)
  useEffect(() => {
    const unsubscribe = chatRepository.subscribeToNumMessages(() => {
      setIsNewChatMessage(true);
    });
    return unsubscribe;
  }, [chatRepository]);

  // 2. Lógica declarativa: Si cambia a la pestaña chat, reseteamos el estado durante el renderizado
  if (isActiveTabChat && isNewChatMessage) {
    setIsNewChatMessage(false);
  }

  // 3. Condición de renderizado: Solo se muestra si hay un mensaje nuevo Y NO estamos en el chat
  const shouldShowBadge = isNewChatMessage && !isActiveTabChat;

  return (
    <>
      <BadgeContainer>{shouldShowBadge && <Badge>New</Badge>}</BadgeContainer>
    </>
  );
};

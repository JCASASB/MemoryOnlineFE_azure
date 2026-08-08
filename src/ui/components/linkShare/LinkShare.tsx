import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppRoutes } from "../../pages/layout/AppRoutes";

export const LinkShare: React.FC = () => {
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    try {
      const params = new URLSearchParams(location.search);
      const gameName = params.get("gameName");
      if (!gameName) return "";

      // Build a hash-router friendly URL pointing to /join with gameName
      const origin = window.location.origin;
      const base = window.location.pathname || "/";
      return `${origin}${base}#${AppRoutes.join}?gameName=${encodeURIComponent(gameName)}`;
    } catch (e) {
      return "";
    }
  }, [location.search]);

  const gameName = useMemo(() => {
    try {
      const params = new URLSearchParams(location.search);
      return params.get("gameName") || "";
    } catch (e) {
      return "";
    }
  }, [location.search]);

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      // ignore
    }
  };

  if (!shareUrl) return null;

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <a href={shareUrl} target="_blank" rel="noreferrer">
        Compartir sala: {gameName}
      </a>
      <button onClick={handleCopy}>
        {copied ? "Copiado" : "Copiar enlace"}
      </button>
    </div>
  );
};

export default LinkShare;

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { Notification } from "@workspace/api-client-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

let sharedSocket: Socket | null = null;

function getSocket(): Socket {
  if (!sharedSocket) {
    sharedSocket = io({
      path: `${basePath}/api/socket.io`,
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
  }
  return sharedSocket;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connected, setConnected] = useState(false);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onNotifications = (payload: Notification[]) => {
      setNotifications(Array.isArray(payload) ? payload : []);
      setHasData(true);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("notifications", onNotifications);

    if (socket.connected) setConnected(true);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("notifications", onNotifications);
    };
  }, []);

  return { notifications, connected, hasData };
}

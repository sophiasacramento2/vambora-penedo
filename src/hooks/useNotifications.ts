import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { alerts } from "@/data/mockData";

export function useNotifications() {
  const { alertsRead } = useAppStore();

  const requestPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    const result = await Notification.requestPermission();
    return result === "granted";
  };

  const sendNotification = (title: string, body: string, tag?: string) => {
    if (Notification.permission !== "granted") return;
    new Notification(title, {
      body,
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      tag,
    });
  };

  // Verifica alertas não lidos e notifica
  useEffect(() => {
    const unread = alerts.filter((a) => !alertsRead.includes(a.id));
    if (unread.length === 0) return;

    requestPermission().then((granted) => {
      if (!granted) return;
      unread.forEach((a) => {
        sendNotification(a.title, a.message, a.id);
      });
    });
  }, []);

  return { requestPermission, sendNotification };
}

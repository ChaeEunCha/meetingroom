import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MeetingRoom - 회의실 예약 시스템",
    short_name: "MeetingRoom",
    description: "회의실 예약 현황을 한눈에 보고 빈 시간을 클릭해 바로 예약하는 웹사이트",
    start_url: "/",
    display: "standalone",
    background_color: "#1E3A5C",
    theme_color: "#1E3A5C",
    lang: "ko",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

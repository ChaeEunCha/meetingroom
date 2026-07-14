"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Reservation, Room, ReservationStatus } from "@/lib/types";
import { todayString } from "@/lib/time";

export default function ReservationList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const [dateFilter, setDateFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "all">("all");
  const [keyword, setKeyword] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [{ data: roomData }, { data: reservationData }] = await Promise.all([
      supabase.from("rooms").select("*").order("id"),
      supabase
        .from("reservations")
        .select("*")
        .order("reservation_date", { ascending: false })
        .order("start_time", { ascending: true }),
    ]);
    if (roomData) setRooms(roomData as Room[]);
    if (reservationData) setReservations(reservationData as Reservation[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const channel = supabase
      .channel("reservation-list-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, () => {
        fetchAll();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  async function handleCancel(id: string) {
    if (!window.confirm("이 예약을 취소하시겠습니까?")) return;
    await supabase.from("reservations").update({ status: "cancelled" }).eq("id", id);
    fetchAll();
  }

  const roomName = (id: number) => rooms.find((r) => r.id === id)?.name ?? `회의실 ${id}`;

  const filtered = reservations.filter((r) => {
    if (dateFilter && r.reservation_date !== dateFilter) return false;
    if (roomFilter !== "all" && r.room_id !== Number(roomFilter)) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      const haystack = `${r.reservee_name} ${r.department} ${r.title}`.toLowerCase();
      if (!haystack.includes(kw)) return false;
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">예약 목록</h1>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500">날짜</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500">회의실</label>
          <select
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="all">전체</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500">상태</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReservationStatus | "all")}
            className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="all">전체</option>
            <option value="confirmed">확정</option>
            <option value="cancelled">취소</option>
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-gray-500">검색 (예약자/부서/제목)</label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="검색어 입력"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={() => {
            setDateFilter("");
            setRoomFilter("all");
            setStatusFilter("all");
            setKeyword("");
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          필터 초기화
        </button>
        <button
          onClick={() => setDateFilter(todayString())}
          className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium hover:bg-gray-200"
        >
          오늘만
        </button>
      </div>

      <p className="mt-4 text-xs text-gray-400 sm:hidden">← 옆으로 밀어서 전체 항목을 확인하세요</p>

      <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200 [-webkit-overflow-scrolling:touch] sm:mt-4">
        <table className="min-w-full divide-y divide-gray-200 whitespace-nowrap text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-500">예약번호</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">회의실</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">날짜</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">시간</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">제목</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">예약자</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">부서</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">상태</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filtered.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-2 text-gray-500">{r.reservation_code}</td>
                <td className="px-3 py-2">{roomName(r.room_id)}</td>
                <td className="px-3 py-2">{r.reservation_date}</td>
                <td className="px-3 py-2">
                  {r.start_time.slice(0, 5)}~{r.end_time.slice(0, 5)}
                </td>
                <td className="px-3 py-2">{r.title}</td>
                <td className="px-3 py-2">{r.reservee_name}</td>
                <td className="px-3 py-2">{r.department}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.status === "confirmed"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {r.status === "confirmed" ? "확정" : "취소"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {r.status === "confirmed" && (
                    <button
                      onClick={() => handleCancel(r.id)}
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      취소
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-gray-500">
                  조건에 맞는 예약이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

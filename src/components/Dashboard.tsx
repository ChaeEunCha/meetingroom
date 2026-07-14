"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Reservation, Room } from "@/lib/types";
import {
  SLOTS,
  minutesToSlotIndex,
  minutesToTime,
  timeToMinutes,
  todayString,
  addDays,
  formatDateLabel,
} from "@/lib/time";
import BookingModal from "@/components/BookingModal";
import ReservationDetailModal from "@/components/ReservationDetailModal";

const LABEL_COL_WIDTH = 200;
const SLOT_COL_WIDTH = 64;
const ROW_HEIGHT = 60;

export default function Dashboard() {
  const [date, setDate] = useState(todayString());
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingTarget, setBookingTarget] = useState<{ room: Room; startMinutes: number } | null>(
    null
  );
  const [detailTarget, setDetailTarget] = useState<Reservation | null>(null);

  const dateRef = useRef(date);
  dateRef.current = date;

  const fetchRooms = useCallback(async () => {
    const { data } = await supabase.from("rooms").select("*").order("id");
    if (data) setRooms(data as Room[]);
  }, []);

  const fetchReservations = useCallback(async (forDate: string) => {
    const { data } = await supabase
      .from("reservations")
      .select("*")
      .eq("reservation_date", forDate)
      .eq("status", "confirmed")
      .order("start_time");
    if (data) setReservations(data as Reservation[]);
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    setLoading(true);
    fetchReservations(date).finally(() => setLoading(false));
  }, [date, fetchReservations]);

  useEffect(() => {
    const channel = supabase
      .channel("reservations-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservations" },
        () => {
          fetchReservations(dateRef.current);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchReservations]);

  function reservationsForRoom(roomId: number) {
    return reservations.filter((r) => r.room_id === roomId);
  }

  function handleCreated() {
    setBookingTarget(null);
    fetchReservations(date);
  }

  function handleCancelled() {
    setDetailTarget(null);
    fetchReservations(date);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">회의실 예약 현황</h1>
          <p className="mt-1 text-sm text-gray-500">빈 시간을 클릭하면 바로 예약할 수 있습니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDate((d) => addDays(d, -1))}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            ◀
          </button>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
          <button
            onClick={() => setDate((d) => addDays(d, 1))}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            ▶
          </button>
          <button
            onClick={() => setDate(todayString())}
            className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium hover:bg-gray-200"
          >
            오늘
          </button>
        </div>
      </div>

      <p className="mt-4 text-sm font-medium text-gray-700">{formatDateLabel(date)}</p>

      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-blue-500" /> 예약됨 (클릭 시 상세/취소)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border border-gray-300 bg-white" /> 빈 시간 (클릭 시 예약)
        </span>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
        <div style={{ minWidth: LABEL_COL_WIDTH + SLOT_COL_WIDTH * SLOTS.length }}>
          {/* Header row */}
          <div
            className="grid border-b border-gray-200 bg-gray-50"
            style={{ gridTemplateColumns: `${LABEL_COL_WIDTH}px repeat(${SLOTS.length}, ${SLOT_COL_WIDTH}px)` }}
          >
            <div className="sticky left-0 z-20 flex items-center bg-gray-50 p-2 text-sm font-semibold text-gray-700">
              회의실
            </div>
            {SLOTS.map((m) => (
              <div
                key={m}
                className="border-l border-gray-200 p-1 text-center text-[11px] text-gray-500"
              >
                {minutesToTime(m)}
              </div>
            ))}
          </div>

          {/* Room rows */}
          {rooms.map((room) => (
            <div
              key={room.id}
              className="relative grid border-b border-gray-100"
              style={{
                gridTemplateColumns: `${LABEL_COL_WIDTH}px repeat(${SLOTS.length}, ${SLOT_COL_WIDTH}px)`,
                gridAutoRows: `${ROW_HEIGHT}px`,
              }}
            >
              <div className="sticky left-0 z-20 flex flex-col justify-center bg-white p-2">
                <span className="text-sm font-medium text-gray-900">{room.name}</span>
                <span className="text-xs text-gray-500">
                  {room.capacity}인 · {room.floor}
                </span>
              </div>

              {SLOTS.map((m, i) => (
                <button
                  key={m}
                  style={{ gridColumn: i + 2, gridRow: 1 }}
                  onClick={() => setBookingTarget({ room, startMinutes: m })}
                  className="border-l border-gray-100 hover:bg-blue-50"
                  aria-label={`${room.name} ${minutesToTime(m)} 예약하기`}
                />
              ))}

              {reservationsForRoom(room.id).map((r) => {
                const startIdx = minutesToSlotIndex(timeToMinutes(r.start_time));
                const endIdx = minutesToSlotIndex(timeToMinutes(r.end_time));
                return (
                  <div
                    key={r.id}
                    style={{ gridColumn: `${startIdx + 2} / ${endIdx + 2}`, gridRow: 1 }}
                    onClick={() => setDetailTarget(r)}
                    className="relative z-10 m-0.5 cursor-pointer overflow-hidden rounded-md bg-blue-500 p-1.5 text-white shadow-sm hover:bg-blue-600"
                    title={`${r.title} · ${r.reservee_name} (${r.department}) · ${r.start_time.slice(0, 5)}~${r.end_time.slice(0, 5)}`}
                  >
                    <div className="truncate text-xs font-semibold">{r.title}</div>
                    <div className="truncate text-[11px] opacity-90">{r.reservee_name}</div>
                  </div>
                );
              })}
            </div>
          ))}

          {!loading && rooms.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-500">회의실 정보를 불러올 수 없습니다.</div>
          )}
        </div>
      </div>

      {bookingTarget && (
        <BookingModal
          room={bookingTarget.room}
          date={date}
          startMinutes={bookingTarget.startMinutes}
          onClose={() => setBookingTarget(null)}
          onCreated={handleCreated}
        />
      )}

      {detailTarget && (
        <ReservationDetailModal
          reservation={detailTarget}
          room={rooms.find((r) => r.id === detailTarget.room_id)}
          onClose={() => setDetailTarget(null)}
          onCancelled={handleCancelled}
        />
      )}
    </div>
  );
}

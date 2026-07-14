"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Room } from "@/lib/types";
import { SLOT_END, SLOT_STEP, minutesToTime, formatDateLabel } from "@/lib/time";

interface Props {
  room: Room;
  date: string;
  startMinutes: number;
  onClose: () => void;
  onCreated: () => void;
}

export default function BookingModal({ room, date, startMinutes, onClose, onCreated }: Props) {
  const defaultEnd = Math.min(startMinutes + 60, SLOT_END);
  const [reserveeName, setReserveeName] = useState("");
  const [department, setDepartment] = useState("");
  const [title, setTitle] = useState("");
  const [endMinutes, setEndMinutes] = useState(defaultEnd);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endOptions: number[] = [];
  for (let m = startMinutes + SLOT_STEP; m <= SLOT_END; m += SLOT_STEP) {
    endOptions.push(m);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reserveeName.trim() || !department.trim() || !title.trim()) {
      setError("모든 항목을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from("reservations").insert({
      room_id: room.id,
      reservee_name: reserveeName.trim(),
      department: department.trim(),
      title: title.trim(),
      reservation_date: date,
      start_time: `${minutesToTime(startMinutes)}:00`,
      end_time: `${minutesToTime(endMinutes)}:00`,
      status: "confirmed",
    });

    setSubmitting(false);

    if (insertError) {
      if (insertError.code === "23P01") {
        setError("이미 예약된 시간대입니다. 다른 시간을 선택해주세요.");
      } else {
        setError("예약 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
      return;
    }

    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">회의실 예약</h2>
        <p className="mt-1 text-sm text-gray-500">
          {room.name} · {formatDateLabel(date)}
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">예약자명</label>
            <input
              type="text"
              value={reserveeName}
              onChange={(e) => setReserveeName(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="홍길동"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">부서</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="마케팅팀"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">회의 제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="주간 팀 회의"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">시작 시각</label>
              <input
                type="text"
                readOnly
                value={minutesToTime(startMinutes)}
                className="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">종료 시각</label>
              <select
                value={endMinutes}
                onChange={(e) => setEndMinutes(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {endOptions.map((m) => (
                  <option key={m} value={m}>
                    {minutesToTime(m)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "예약 중..." : "예약 확정"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

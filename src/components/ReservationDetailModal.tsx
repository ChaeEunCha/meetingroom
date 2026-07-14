"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Reservation, Room } from "@/lib/types";
import { formatDateLabel } from "@/lib/time";

interface Props {
  reservation: Reservation;
  room: Room | undefined;
  onClose: () => void;
  onCancelled: () => void;
}

export default function ReservationDetailModal({ reservation, room, onClose, onCancelled }: Props) {
  const [cancelling, setCancelling] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setCancelling(true);
    setError(null);
    const { error: updateError } = await supabase
      .from("reservations")
      .update({ status: "cancelled" })
      .eq("id", reservation.id);
    setCancelling(false);

    if (updateError) {
      setError("취소 중 오류가 발생했습니다. 다시 시도해주세요.");
      return;
    }
    onCancelled();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{reservation.title}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {room?.name ?? `회의실 ${reservation.room_id}`} · {formatDateLabel(reservation.reservation_date)}
            </p>
          </div>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            확정
          </span>
        </div>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">예약번호</dt>
            <dd className="text-gray-900">{reservation.reservation_code}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">예약자</dt>
            <dd className="text-gray-900">
              {reservation.reservee_name} ({reservation.department})
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">시간</dt>
            <dd className="text-gray-900">
              {reservation.start_time.slice(0, 5)} ~ {reservation.end_time.slice(0, 5)}
            </dd>
          </div>
        </dl>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            닫기
          </button>
          {!confirmingCancel ? (
            <button
              onClick={() => setConfirmingCancel(true)}
              className="rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              예약 취소
            </button>
          ) : (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {cancelling ? "취소 중..." : "정말 취소할까요?"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

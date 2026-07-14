export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-xl font-bold text-gray-900">오프라인 상태입니다</h1>
      <p className="mt-2 text-sm text-gray-500">
        인터넷 연결이 끊겨 있어요. 이전에 열어봤던 화면은 그대로 볼 수 있고, 연결이 복구되면
        최신 예약 현황이 다시 표시됩니다.
      </p>
    </div>
  );
}

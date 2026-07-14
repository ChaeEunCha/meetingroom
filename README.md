# meetingroom

회의실(1~6번) 예약 현황을 한눈에 보고, 빈 시간을 클릭해 바로 예약할 수 있는 웹사이트입니다. 상세 기획은 [PRD.md](./PRD.md) 참고.

## 시작하기

`.env.local`에 Supabase 프로젝트 정보가 이미 설정되어 있습니다 (`.env.example` 참고).

```bash
npm install
npm run dev
```

http://localhost:3000 에서 예약 현황 대시보드를, `/reservations` 에서 예약 목록/필터 화면을 확인할 수 있습니다.

## 구조

- `/` — 회의실 × 시간 그리드 대시보드. 빈 슬롯 클릭 → 예약, 예약된 슬롯 클릭 → 상세/취소
- `/reservations` — 날짜/회의실/상태/키워드로 필터링하는 예약 목록
- `src/lib/supabase.ts` — Supabase 클라이언트
- `src/lib/time.ts` — 09:00~18:00, 30분 단위 타임슬롯 유틸

## 데이터베이스 (Supabase)

`rooms`, `reservations` 두 테이블로 구성되며, 같은 회의실·같은 시간대의 확정 예약이 겹치지 않도록 `EXCLUDE USING gist` 제약조건으로 이중 예약을 DB 레벨에서 방지합니다. 예약 생성/취소는 Supabase Realtime을 통해 모든 접속자 화면에 실시간으로 반영됩니다.

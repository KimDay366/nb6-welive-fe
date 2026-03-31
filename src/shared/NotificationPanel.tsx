import { useRouter } from 'next/router';

export interface Notification {
  notificationId: string;
  title: string;
  content: string;
  notificationType: string;
  notifiedAt: string;
  isChecked: boolean;
  url: string;
  complaintId?: string;
  noticeId?: string;
  pollId?: string;
}

interface NotificationPanelProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  role?: string;
  onClose: () => void;
  onMarkAsRead: (notificationId: string) => Promise<void>;
}

// 상대 시간 포맷 함수
function getRelativeTime(isoString: string) {
  const now = new Date();
  const date = new Date(isoString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}일 전`;

  return date.toLocaleDateString('ko-KR');
}

// 알림 메시지 포맷 함수
function getFormattedMessage(alarm: Notification) {
  const { notificationType, title, content } = alarm;
  const titleDisplay = title ? `"${title}"` : '알림';

  switch (notificationType) {
    // 1. 민원
    case 'COMPLAINT_RAISED':
      return `민원 ${titleDisplay}이 접수되었습니다.`;
    case 'COMPLAINT_IN_PROGRESS':
      return `민원 ${titleDisplay}이 처리 중입니다.`;
    case 'COMPLAINT_RESOLVED':
      return `민원 ${titleDisplay}이 처리 완료되었습니다.`;
    case 'COMPLAINT_REJECTED':
      return `민원 ${titleDisplay}이 거절되었습니다.`;

    // 2. 공지사항
    case 'NOTICE':
      return `공지사항 ${titleDisplay}이 등록되었습니다.`;

    // 3. 투표
    case 'POLL_SET':
      return `투표 ${titleDisplay}가 등록되었습니다.`;
    case 'POLL_START':
      return `투표 ${titleDisplay}가 시작되었습니다.`;
    case 'POLL_END':
      return `투표 ${titleDisplay}가 종료되었습니다.`;

    // 4. 회원가입 (Admin 전용)
    case 'SIGNUP_REQ': {
      // content: "홍길동님이 가입을 요청하였습니다"
      const name = content?.split('님이')[0] || title || '새로운 사용자';
      return `${name}님이 회원가입을 요청했습니다.`;
    }

    default:
      return content || title || '새로운 알림이 도착했습니다.';
  }
}

// 프론트엔드 라우팅 주소 변환 함수
function getFrontendUrl(alarm: Notification, role?: string) {
  const { url, notificationType, complaintId, noticeId, pollId } = alarm;

  // URL에서 UUID 추출 (예: "poll/550e8400-...")
  const pathId = url?.includes('/') ? url.split('/').pop() : null;
  const id = complaintId || noticeId || pollId || pathId;

  // 회원가입 요청의 경우 ID가 없어도 페이지 이동 가능
  if (!id && notificationType !== 'SIGNUP_REQ') return url || '/';

  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const prefix = isAdmin ? '/admin' : '/resident';

  switch (notificationType) {
    case 'COMPLAINT_RAISED':
    case 'COMPLAINT_IN_PROGRESS':
    case 'COMPLAINT_RESOLVED':
    case 'COMPLAINT_REJECTED':
      return `${prefix}/civil/detail/${id}`;

    case 'NOTICE':
      return `${prefix}/notice/detail/${id}`;

    case 'POLL_SET':
    case 'POLL_START':
    case 'POLL_END':
      // Backend: poll/{uuid} -> Frontend: voting/detail/{uuid}
      return `${prefix}/voting/detail/${id}`;

    case 'SIGNUP_REQ':
      return `/admin/resident`; // 관리자 페이지 입주민 관리로 이동

    default:
      return url || '/';
  }
}

export default function NotificationPanel({
  notifications,
  setNotifications,
  role,
  onClose,
  onMarkAsRead,
}: NotificationPanelProps) {
  const router = useRouter();

  // 알림 클릭 시 읽음 처리 및 이동
  const handleClick = async (alarm: Notification) => {
    try {
      const { notificationId } = alarm;
      await onMarkAsRead(notificationId);

      setNotifications((prev) => prev.filter((item) => item.notificationId !== notificationId));

      const feUrl = getFrontendUrl(alarm, role);
      if (feUrl) {
        router.push(feUrl);
        onClose(); // 페이지 이동 후 패널 닫기
      }
    } catch (error) {
      console.error('알림 처리 실패:', error);
    }
  };

  return (
    <div className='absolute top-12 -right-4 z-20 w-[320px] rounded-xl border border-gray-200 bg-white p-5 shadow-md'>
      {notifications.length === 0 ? (
        <p className='py-4 text-center text-sm text-gray-400'>새로운 알림이 없습니다</p>
      ) : (
        notifications.map((alarm) => (
          <div
            key={alarm.notificationId}
            className={`mb-4 flex cursor-pointer flex-col gap-1 border-b border-gray-100 pb-3 last:border-b-0 ${alarm.isChecked ? 'opacity-50' : ''}`}
            onClick={() => handleClick(alarm)}
          >
            {/* <p className='text-sm text-gray-800'>{alarm.content}</p> */}
            <p className='text-sm font-medium text-gray-800'>{getFormattedMessage(alarm)}</p>
            <div className='flex items-center justify-between'>
              <span className='text-xs text-gray-400'>{getRelativeTime(alarm.notifiedAt)}</span>
              <button
                className='text-main text-xs font-bold hover:underline'
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick(alarm);
                }}
              >
                링크
              </button>
            </div>
          </div>
        ))
      )}
      <button
        onClick={onClose}
        className='bg-main mt-4 w-full rounded-lg py-1.5 text-sm text-white'
      >
        닫기
      </button>
    </div>
  );
}

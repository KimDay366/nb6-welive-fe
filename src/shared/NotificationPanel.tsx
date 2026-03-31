export interface Notification {
  notificationId: string;
  title: string;
  content: string;
  notificationType: string;
  notifiedAt: string;
  isChecked: boolean;
  complaintId?: string;
  noticeId?: string;
  pollId?: string;
}

interface NotificationPanelProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
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

  switch (notificationType) {
    // 1. 민원
    case 'COMPLAINT_RAISED':
      return `민원 "${title}"이 접수되었습니다.`;
    case 'COMPLAINT_IN_PROGRESS':
      return `민원 "${title}"이 처리 중입니다.`;
    case 'COMPLAINT_RESOLVED':
      return `민원 "${title}"이 처리 완료되었습니다.`;
    case 'COMPLAINT_REJECTED':
      return `민원 "${title}"이 거절되었습니다.`;

    // 2. 공지사항
    case 'NOTICE':
      return `공지사항 "${title}"이 등록되었습니다.`;

    // 3. 투표
    case 'POLL_SET': // 투표 등록/생성 시
      return `투표 "${title}"가 등록되었습니다.`;
    case 'POLL_START': // 투표 시작 시
      return `투표 "${title}"가 시작되었습니다.`;
    case 'POLL_END': // 투표 종료 시
      return `투표 "${title}"가 종료되었습니다.`;

    // 4. 회원가입 (Admin 전용)
    case 'SIGNUP_REQ':
      const name = content.split('님이')[0];
      return `"${name}"님이 회원가입을 요청했습니다.`;
    // return content.includes('가입을 요청') ? content : `"${title}"님이 회원가입을 요청했습니다.`;

    default:
      return content;
  }
}

export default function NotificationPanel({
  notifications,
  setNotifications,
  onClose,
  onMarkAsRead,
}: NotificationPanelProps) {
  // 알림 클릭 시 읽음 처리
  const handleClick = async (notificationId: string) => {
    try {
      await onMarkAsRead(notificationId);

      setNotifications((prev) => prev.filter((alarm) => alarm.notificationId !== notificationId));
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
            onClick={() => handleClick(alarm.notificationId)}
          >
            {/* <p className='text-sm text-gray-800'>{alarm.content}</p> */}
            <p className='text-sm text-gray-800'>{getFormattedMessage(alarm)}</p>
            <span className='text-xs text-gray-400'>{getRelativeTime(alarm.notifiedAt)}</span>
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

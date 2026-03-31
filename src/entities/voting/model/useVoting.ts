import { useEffect, useState } from 'react';
import { VotingList } from '../type';
import { getVotingList, PollListItem, PollStatus } from '../api/voting.api';
import { useAuthStore } from '@/shared/store/auth.store';

export function useVoting() {
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState<VotingList[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [dongFilter, setDongFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<PollStatus | undefined>();
  const [keyword, setKeyword] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // 유저가 일반 입주민(USER)인 경우, 별도 필터가 선택되지 않았다면 본인의 동을 기본값으로 사용
    const fetchData = async () => {
      try {
        let pollsRaw: PollListItem[] = [];
        let totalCountRaw = 0;

        if (user?.role === 'USER') {
          // 1. '전체(all)' 투표와 2. '본인 동' 투표를 각각 요청하여 합침
          const [allRes, myDongRes] = await Promise.all([
            getVotingList({
              page: 1,
              limit: 100,
              buildingPermission: 'ALL',
              status: statusFilter,
              keyword: keyword?.trim(),
            }),
            user.residentDong
              ? getVotingList({
                  page: 1,
                  limit: 100,
                  buildingPermission: user.residentDong,
                  status: statusFilter,
                  keyword: keyword?.trim(),
                })
              : Promise.resolve({ polls: [], totalCount: 0 }),
          ]);

          // 중복 제거 및 데이터 병합
          const merged = [...allRes.polls, ...myDongRes.polls];
          const uniquePolls = merged.filter(
            (poll, index, self) => index === self.findIndex((p) => p.pollId === poll.pollId),
          );

          pollsRaw = uniquePolls;
          totalCountRaw = uniquePolls.length;

          console.log('입주민 병합 데이터:', pollsRaw);
        } else {
          // 관리자인 경우 기존 필터링 유지
          const res = await getVotingList({
            page: currentPage,
            limit: 11,
            buildingPermission: dongFilter,
            status: statusFilter,
            keyword: keyword?.trim(),
          });
          pollsRaw = res.polls;
          totalCountRaw = res.totalCount;
        }

        const parsed: VotingList[] = pollsRaw.map((item: PollListItem) => ({
          pollId: item.pollId,
          userId: item.userId,
          title: item.title,
          writerName: item.writerName,
          buildingPermission: item.buildingPermission,
          createdAt: item.createdAt,
          startDate: item.startDate,
          endDate: item.endDate,
          status: item.status,
        }));

        setTotalCount(totalCountRaw);

        const sorted = parsed.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        setData(sorted);
      } catch (error) {
        console.error('투표 데이터 불러오기 실패:', error);
      }
    };

    fetchData();
  }, [dongFilter, statusFilter, keyword, currentPage]);

  return {
    data,
    totalCount,
    dongFilter,
    setDongFilter,
    statusFilter,
    setStatusFilter,
    keyword,
    setKeyword,
    currentPage,
    setCurrentPage,
  };
}

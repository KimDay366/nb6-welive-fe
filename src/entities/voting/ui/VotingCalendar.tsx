import 'react-calendar/dist/Calendar.css';
import Calendar, { CalendarProps } from 'react-calendar';
import { useState } from 'react';
import { customStyle } from '../model/VotingCalendar.styles';
import Button from '@/shared/Button';
import Select from '@/shared/Select';

const PERIOD_OPTIONS = [
  { label: '오전', value: 'AM' },
  { label: '오후', value: 'PM' },
];

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  label: `${i + 1}시`,
  value: String(i + 1),
}));

const MINUTE_OPTIONS = Array.from({ length: 6 }, (_, i) => ({
  label: `${i * 10}분`,
  value: String(i * 10).padStart(2, '0'),
}));

const parseTime = (timeStr: string) => {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h < 12 ? 'AM' : 'PM';
  let hour = h % 12;
  if (hour === 0) hour = 12;
  return { period, hour: String(hour), minute: String(m).padStart(2, '0') };
};

const formatToHHMM = (period: string, hour: string, minute: string) => {
  let h = Number(hour);
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${minute}`;
};

interface VotingCalendarProps {
  onSelect: (
    range: [Date | null, Date | null],
    times: { startTime: string; endTime: string },
  ) => void;
}

export default function VotingCalendar({ onSelect }: VotingCalendarProps) {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startTime, setStartTime] = useState('12:00');
  const [endTime, setEndTime] = useState('12:00');

  const handleChange: CalendarProps['onChange'] = (value) => {
    if (Array.isArray(value)) {
      setDateRange([value[0], value[1]]);
    } else {
      setDateRange([value, null]);
    }
  };

  const handleConfirm = () => {
    onSelect(dateRange, { startTime, endTime });
  };

  return (
    <div className='rounded-xl border border-gray-200 bg-white px-[24px] pt-[16px] pb-[32px]'>
      <style>{customStyle}</style>
      <Calendar
        onChange={handleChange}
        value={dateRange}
        selectRange={true}
        locale='en-US'
        prev2Label={null}
        next2Label={null}
        className='customStyle'
      />

      <div className='mt-6'>
        <label className='mb-2 block text-[14px] font-semibold'>시작 시간</label>
        <div className='flex items-center gap-[10px]'>
          <Select
            options={PERIOD_OPTIONS}
            value={parseTime(startTime).period}
            onChange={(val) =>
              setStartTime(
                formatToHHMM(val, parseTime(startTime).hour, parseTime(startTime).minute),
              )
            }
            width='w-[80px]'
          />
          <Select
            options={HOUR_OPTIONS}
            value={parseTime(startTime).hour}
            onChange={(val) =>
              setStartTime(
                formatToHHMM(parseTime(startTime).period, val, parseTime(startTime).minute),
              )
            }
            width='w-[80px]'
          />
          <Select
            options={MINUTE_OPTIONS}
            value={parseTime(startTime).minute}
            onChange={(val) =>
              setStartTime(
                formatToHHMM(parseTime(startTime).period, parseTime(startTime).hour, val),
              )
            }
            width='w-[80px]'
          />
        </div>
      </div>

      <div className='mt-4'>
        <label className='mb-2 block text-[14px] font-semibold'>종료 시간</label>
        <div className='flex items-center gap-[10px]'>
          <Select
            options={PERIOD_OPTIONS}
            value={parseTime(endTime).period}
            onChange={(val) =>
              setEndTime(formatToHHMM(val, parseTime(endTime).hour, parseTime(endTime).minute))
            }
            width='w-[80px]'
          />
          <Select
            options={HOUR_OPTIONS}
            value={parseTime(endTime).hour}
            onChange={(val) =>
              setEndTime(formatToHHMM(parseTime(endTime).period, val, parseTime(endTime).minute))
            }
            width='w-[80px]'
          />
          <Select
            options={MINUTE_OPTIONS}
            value={parseTime(endTime).minute}
            onChange={(val) =>
              setEndTime(formatToHHMM(parseTime(endTime).period, parseTime(endTime).hour, val))
            }
            width='w-[80px]'
          />
        </div>
      </div>

      <Button fill={true} onClick={handleConfirm} className='mt-5'>
        선택완료
      </Button>
    </div>
  );
}

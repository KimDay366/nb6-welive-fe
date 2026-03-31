import Select from '@/shared/Select';

interface SelectFiltersProps {
  filters: {
    building: string;
    unitNumber: string;
    isHouseholder: 'HOUSEHOLDER' | 'MEMBER' | 'all';
    isRegistered: boolean | 'all';
  };
  options: {
    building: { value: string; label: string }[];
    unitNumber: { value: string; label: string }[];
    isHouseholder: { value: string; label: string }[];
    isRegistered: { value: string; label: string }[];
  };
  onChange: (key: keyof SelectFiltersProps['filters'], value: string | boolean) => void;
}

export default function SelectFilters({ filters, options, onChange }: SelectFiltersProps) {
  return (
    <div className='flex items-center gap-4'>
      <span>
        <Select
          label='동'
          options={options.building}
          value={filters.building}
          onChange={(v) => onChange('building', v)}
        />
      </span>
      <span>
        <Select
          label='호수'
          options={options.unitNumber}
          value={filters.unitNumber}
          onChange={(v) => onChange('unitNumber', v)}
        />
      </span>
      <span>
        <Select
          label='거주'
          options={options.isHouseholder}
          value={filters.isHouseholder}
          onChange={(v) => onChange('isHouseholder', v as any)}
        />
      </span>
      <span>
        <Select
          label='위리브 가입'
          options={options.isRegistered}
          value={String(filters.isRegistered)}
          onChange={(v) =>
            onChange('isRegistered', v === 'true' ? true : v === 'false' ? false : 'all')
          }
        />
      </span>
    </div>
  );
}

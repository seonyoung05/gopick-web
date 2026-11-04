// src/pages/dev/sections/FilterSection.tsx
import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { FilterPanel, createFilterValues } from '../../../components/common/FilterPanel';
import { PEOPLE_FILTERS, PROJECT_FILTERS } from '../../../constants/filters';

export function FilterSection() {
  const [peopleFilters, setPeopleFilters] = useState(() => createFilterValues(PEOPLE_FILTERS));
  const [projectFilters, setProjectFilters] = useState(() => createFilterValues(PROJECT_FILTERS));

  return (
    <section>
      <h1 className="t-h1">FilterPanel</h1>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <FilterPanel groups={PEOPLE_FILTERS} values={peopleFilters} onChange={setPeopleFilters} />
        <FilterPanel
          groups={PROJECT_FILTERS}
          values={projectFilters}
          onChange={setProjectFilters}
          extraAction={
            <Button variant="ghost" size="sm" block>
              내 프로필로 채우기
            </Button>
          }
        />
        <pre
          className="t-caption"
          style={{ background: 'var(--surface)', padding: 16, borderRadius: 12 }}
        >
          {JSON.stringify(peopleFilters, null, 2)}
        </pre>
      </div>
    </section>
  );
}
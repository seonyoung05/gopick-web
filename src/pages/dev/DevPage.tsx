// src/pages/dev/DevPage.tsx
import { ButtonSection } from './sections/ButtonSection';
import { ChipSection } from './sections/ChipSection';
import { LabelSection } from './sections/LabelSection';
import { AvatarSection } from './sections/AvatarSection';
import { InputSection } from './sections/InputSection';
import { SegmentTabsSection } from './sections/SegmentTabsSection';
import { FormControlSection } from './sections/FormControlSection';
import { FilterSection } from './sections/FilterSection';
import { FoundationSection } from './sections/FoundationSection';
import { ApiTestSection } from './sections/ApiTestSection';

export default function DevPage() {
  return (
    <div style={{ padding: 40, display: 'grid', gap: 40 }}>
      <ApiTestSection />
      <ButtonSection />
      <ChipSection />
      <LabelSection />
      <AvatarSection />
      <InputSection />
      <SegmentTabsSection />
      <FormControlSection />
      <FilterSection />
      <FoundationSection />
    </div>
  );
}
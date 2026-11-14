// src/components/ui/Chip/ChipGroup.tsx
import clsx from 'clsx';
import { Chip, type ChipSelectedStyle, type ChipSize } from './Chip';
import styles from './Chip.module.css';

interface BaseProps {
  options: readonly string[];
  size?: ChipSize;
  /** 지정하지 않으면 복수 선택=soft, 단일 선택=filled */
  selectedStyle?: ChipSelectedStyle;
  className?: string;
  'aria-label'?: string;
}

interface MultipleProps extends BaseProps {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
}

interface SingleProps extends BaseProps {
  multiple?: false;
  value: string | null;
  onChange: (value: string) => void;
}

export type ChipGroupProps = MultipleProps | SingleProps;

/** 복수 선택인지 TypeScript에게 확실히 알려 주는 함수 */
function isMultiple(props: ChipGroupProps): props is MultipleProps {
  return props.multiple === true;
}

export function ChipGroup(props: ChipGroupProps) {
  const { options, size = 'md', className } = props;
  const selectedStyle = props.selectedStyle ?? (isMultiple(props) ? 'soft' : 'filled');

  const isSelected = (option: string) =>
    isMultiple(props) ? props.value.includes(option) : props.value === option;

  const handleClick = (option: string) => {
    if (isMultiple(props)) {
      const next = props.value.includes(option)
        ? props.value.filter((v) => v !== option)
        : [...props.value, option];
      props.onChange(next);
    } else {
      props.onChange(option);
    }
  };

  return (
    <div
      role="group"
      aria-label={props['aria-label']}
      className={clsx(styles.group, size === 'compact' && styles.groupCompact, className)}
    >
      {options.map((option) => (
        <Chip
          key={option}
          size={size}
          selected={isSelected(option)}
          selectedStyle={selectedStyle}
          onClick={() => handleClick(option)}
        >
          {option}
        </Chip>
      ))}
    </div>
  );
}
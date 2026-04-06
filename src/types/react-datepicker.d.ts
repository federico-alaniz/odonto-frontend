declare module 'react-datepicker' {
  import { ComponentType } from 'react';

  export interface ReactDatePickerProps {
    selected?: Date | null;
    onChange?: (date: Date | null, event?: Event) => void;
    dateFormat?: string | string[];
    className?: string;
    placeholderText?: string;
    maxDate?: Date;
    showMonthDropdown?: boolean;
    showYearDropdown?: boolean;
    dropdownMode?: 'scroll' | 'select';
    [key: string]: any;
  }

  const ReactDatePicker: ComponentType<ReactDatePickerProps>;
  export default ReactDatePicker;
}

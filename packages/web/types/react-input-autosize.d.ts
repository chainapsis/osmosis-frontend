/* eslint-disable */
// Type augmentation for react-input-autosize React 18 compatibility
declare module "react-input-autosize" {
  import { Component, InputHTMLAttributes } from "react";

  export interface AutosizeInputProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, "style"> {
    inputRef?: (ref: HTMLInputElement | null) => void;
    inputStyle?: React.CSSProperties;
    inputClassName?: string;
    minWidth?: number | string;
    placeholderIsMinWidth?: boolean;
    extraWidth?: number | string;
    injectStyles?: boolean;
    style?: React.CSSProperties;
  }

  class AutosizeInput extends Component<AutosizeInputProps> {
    refs: {
      input?: HTMLInputElement;
      sizer?: HTMLElement;
      placeHolderSizer?: HTMLElement;
    };
  }

  export default AutosizeInput;
}

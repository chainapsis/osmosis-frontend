/* eslint-disable */
// Type augmentation for react-modal React 18 compatibility
declare module "react-modal" {
  import { Component, ReactNode, CSSProperties } from "react";

  export interface ReactModalPortalProps {
    defaultStyles?: {
      overlay?: CSSProperties;
      content?: CSSProperties;
    };
  }

  export interface ReactModalProps {
    isOpen: boolean;
    style?: {
      content?: CSSProperties;
      overlay?: CSSProperties;
    };
    className?:
      | string
      | {
          base?: string;
          afterOpen?: string;
          beforeClose?: string;
        };
    overlayClassName?:
      | string
      | {
          base?: string;
          afterOpen?: string;
          beforeClose?: string;
        };
    appElement?: HTMLElement | {};
    onAfterOpen?: (obj?: {
      contentEl: HTMLElement;
      overlayEl: HTMLElement;
    }) => void;
    onAfterClose?: () => void;
    onRequestClose?: (event: React.MouseEvent | React.KeyboardEvent) => void;
    closeTimeoutMS?: number;
    ariaHideApp?: boolean;
    shouldFocusAfterRender?: boolean;
    shouldCloseOnOverlayClick?: boolean;
    shouldCloseOnEsc?: boolean;
    shouldReturnFocusAfterClose?: boolean;
    role?: string;
    contentLabel?: string;
    aria?: {
      [key: string]: string;
    };
    data?: {
      [key: string]: string;
    };
    children?: ReactNode;
    htmlOpenClassName?: string;
    bodyOpenClassName?: string;
    portalClassName?: string;
    overlayRef?: (overlay: HTMLDivElement) => void;
    contentRef?: (content: HTMLDivElement) => void;
    overlayElement?: (props: any, contentEl: ReactNode) => ReactNode;
    contentElement?: (props: any, children: ReactNode) => ReactNode;
    parentSelector?: () => HTMLElement;
    testId?: string;
    id?: string;
    preventScroll?: boolean;
  }

  class ReactModal extends Component<ReactModalProps> {
    refs: {
      overlay?: HTMLDivElement;
      content?: HTMLDivElement;
    };

    static setAppElement(element: string | HTMLElement): void;
    static defaultStyles: ReactModalPortalProps["defaultStyles"];
  }

  export function setAppElement(element: string | HTMLElement): void;
  export default ReactModal;
}

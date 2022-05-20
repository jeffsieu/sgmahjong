import {
  PropsWithChildren,
  useEffect,
  createContext,
  useState,
  useRef,
  useMemo,
} from "react";

import "./TooltipContext.css";

export type TooltipContextValue = {
  setContent: (content: string | null) => void;
};

export const TooltipContext: React.Context<TooltipContextValue> = createContext(
  {
    setContent: (content: string | null) => {},
  }
);

const TooltipContextProvider = (props: PropsWithChildren<{}>) => {
  const tooltipContainer = useRef(null);

  const [content, setContent] = useState<string | null>(null);

  const getTooltipStyle = (
    pageX: number,
    pageY: number
  ): React.CSSProperties => {
    return {
      transform: `translate(0%, -100%) translate(${pageX}px, ${pageY}px)`,
    };
  };

  const [tooltipStyle, setTooltipStyle] = useState(getTooltipStyle(0, 0));

  useEffect(() => {
    const updateLocation = (event: MouseEvent) => {
      setTooltipStyle(getTooltipStyle(event.pageX, event.pageY));
    };
    window.addEventListener("mousemove", updateLocation);
  }, []);

  const value = useMemo(
    () => ({
      setContent,
    }),
    [setContent]
  );

  return (
    <TooltipContext.Provider value={value}>
      {props.children}
      {content && (
        <div
          className="tooltip-container"
          style={tooltipStyle}
          ref={tooltipContainer}
        >
          <div className="tooltip">{content}</div>
        </div>
      )}
    </TooltipContext.Provider>
  );
};

export default TooltipContextProvider;

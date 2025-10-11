"use client";

import { FC, ReactNode } from "react";

type TransitionProviderProps = {
  children?: ReactNode;
};

const TransitionProvider: FC<TransitionProviderProps> = ({ children }) => {
  return (
    <div className="animate-slide-in">
      {children}
    </div>
  );
};

export default TransitionProvider;
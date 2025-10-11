"use client";

import Link from "next/link";
import { FC, Key, ReactNode } from "react";
import { UrlObject } from "url";

type CustomLinkProps = {
  href: string;
  key?: Key;
  children?: ReactNode;
  className?: string;
};

const CustomLink: FC<CustomLinkProps> = ({
  href,
  children,
  className,
  key,
}: CustomLinkProps) => {
  return (
    <Link key={key} className={className} href={href as unknown as UrlObject}>
      {children}
    </Link>
  );
};

export default CustomLink;

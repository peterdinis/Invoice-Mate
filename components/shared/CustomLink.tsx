"use client";

import Link from "next/link";
import { FC, Key, ReactNode } from "react";
import { UrlObject } from "url";

type CustomLinkProps = {
  href: string;
  children?: ReactNode;
  className?: string;
};

const CustomLink: FC<CustomLinkProps> = ({
  href,
  children,
  className,
}: CustomLinkProps) => {
  return (
    <Link className={className} href={href as unknown as UrlObject}>
      {children}
    </Link>
  );
};

export default CustomLink;

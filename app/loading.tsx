import { Spinner } from "@/components/ui/spinner";
import { FC, Suspense } from "react";

const Loader: FC = () => {
  return <Suspense fallback={<Spinner />} />
};

export default Loader;

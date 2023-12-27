import { FC } from "react";
import clsx from "clsx";
import css from "./Badge.module.css";

interface PropTypes {
  color?: "green" | "red" | "yellow";
}

const Badge: FC<PropTypes> = ({ color }) => {
  color = color ?? "green";
  return <div className={clsx(css[`badge`], css[`badge-${color}`])} />;
};

export { Badge };

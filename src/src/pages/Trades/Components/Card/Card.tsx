import { Colors } from "@payconstruct/design-system";
import React, { CSSProperties } from "react";
import style from "./Card.module.css";

interface CardProps {
  style?: CSSProperties;
  className?: string;
}

const Card: React.FC<CardProps> = (props) => {
  const customStyles = { borderColor: Colors.grey.neutral100, ...props.style };

  return (
    <article className={style["card"]} style={customStyles}>
      {props.children}
    </article>
  );
};

export { Card };

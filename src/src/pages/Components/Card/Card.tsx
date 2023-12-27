import { Colors } from "@payconstruct/design-system";
import React, { CSSProperties } from "react";
import style from "./Card.module.css";

interface CardProps {
  style?: CSSProperties;
  className?: string;
}

const Card: React.FC<CardProps> = (props) => {
  const customStyles = { ...props.style, borderColor: Colors.grey.neutral100 };

  return (
    <article className={style["card"]} style={customStyles}>
      {props.children}
    </article>
  );
};

export { Card };

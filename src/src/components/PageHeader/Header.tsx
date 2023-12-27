import React from "react";
import { Text, Colors } from "@payconstruct/design-system";
import style from "./pageHeader.module.css";
import { Spacer } from "../Spacer/Spacer";

/**
 * Header Component for Pages
 */
const Header: React.FC = (props) => {
  return <div className={style["page-header"]}>{props.children}</div>;
};

/**
 * Position Content on the Left Side of Header
 */
const LeftSide: React.FC = (props): JSX.Element => (
  <div className={style["page-header__leftSide"]}>{props.children}</div>
);

/**
 * Position Content on the Right Side of Header
 */
const RightSide: React.FC = (props): JSX.Element => (
  <div className={style["page-header__rightSide"]}>{props.children}</div>
);

interface TitleProps {
  subtitle?: string;
}
/**
 * Title for the Header Component
 */
const Title: React.FC<TitleProps> = (props): JSX.Element => (
  <div className={style["page-header__title-wrapper"]}>
    <div className={style["page-header__title"]}>{props.children}</div>
    {props.subtitle && (
      <>
        <Spacer size={8} />
        <Text
          label={props.subtitle}
          weight="regular"
          color={Colors.grey.neutral500}
          size="medium"
        ></Text>
      </>
    )}
  </div>
);

const HeaderContent = {
  Title,
  LeftSide,
  RightSide
};

export { Header, HeaderContent };

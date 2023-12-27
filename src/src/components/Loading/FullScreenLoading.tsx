import { Spin } from "antd";
import { selectLoading } from "../../config/general/generalSlice";
import { useAppSelector } from "../../redux/hooks/store";
import styles from "./FullScreenLoading.module.css";

const FullScreenLoading: React.FC = () => {
  const isLoading = useAppSelector(selectLoading);

  if (!isLoading) return <div></div>;
  return (
    <>
      <div className={styles["FullScreenLoading__loading"]}>
        <Spin />
      </div>
      <div className={styles["FullScreenLoading"]}></div>
    </>
  );
};

export { FullScreenLoading };

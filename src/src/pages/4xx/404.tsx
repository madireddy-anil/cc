import { Button } from "@payconstruct/design-system";
import { Result } from "antd";
import { useNavigate } from "react-router-dom";

const PageNotFound = () => {
  const navigate = useNavigate();
  return (
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      style={{ width: "100%" }}
      extra={
        <div style={{ textAlign: "center", display: "inline-block" }}>
          <Button
            type="primary"
            label="Back Home"
            onClick={() => navigate("/")}
          />
        </div>
      }
    />
  );
};

export { PageNotFound as default };

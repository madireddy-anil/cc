import { Steps as DSSteps, Col, Row } from "@payconstruct/design-system";

type Step = {
  key: number;
  title: string;
  description?: string;
  content: React.ReactNode;
};

interface StepsProps {
  steps: Step[];
  currentStep: number;
  onChange?: (number: number) => void;
}

const Steps: React.FC<StepsProps> = ({ steps, currentStep, onChange }) => {
  const { Step, StepContent } = DSSteps;
  return (
    <Row gutter={32}>
      <Col span={6}>
        <DSSteps stepType="line" current={currentStep} onChange={onChange}>
          {steps.map((item) => {
            return <Step key={item.key} title={item.title} />;
          })}
        </DSSteps>
      </Col>
      <Col span={18}>
        {steps.map((item) => {
          return (
            <StepContent key={item.title} current={currentStep} id={item.key}>
              {item.content}
            </StepContent>
          );
        })}
      </Col>
    </Row>
  );
};

export { Steps };

import React, { useEffect, useState } from "react";
import { Modal, Spin } from "@payconstruct/design-system";

import { useAppSelector } from "../../../../../../redux/hooks/store";
import { useGetStakeHoldersByClientIdQuery } from "../../../../../../services/clientManagement";
import { validationOnData } from "../../../../../../config/transformer";

import { PersonCard } from "../../Card/Person/Person";

interface TermsOfServiceModalProps {
  show: boolean;
  title: any;
  termsOfService: any[];
  timezone?: any;
  onCancelText: string;
  onClickCancel: () => void;
}

const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({
  show,
  title,
  termsOfService,
  timezone,
  onCancelText,
  onClickCancel
}) => {
  const [count, setCount] = useState<number>(0);

  // Getting the Store Data
  const {
    clients: { id: entityId }
  } = useAppSelector((state) => state.clientManagement);

  // Get Stakeholder Data By ClientID
  const { people, isLoadingAllPeople } = useGetStakeHoldersByClientIdQuery(
    {
      randomName: count,
      entityId: entityId ?? ""
    },
    {
      selectFromResult: ({
        data,
        isSuccess,
        isFetching,
        isLoading,
        isError
      }) => ({
        people: validationOnData(data?.data?.people, "array"),
        isGetAllPeopleSuccess: isSuccess,
        isFetchingAllPeople: isFetching,
        isLoadingAllPeople: isLoading,
        isGetAllFileError: isError
      }),
      refetchOnMountOrArgChange: true,
      skip: entityId === undefined
    }
  );

  useEffect(() => {
    setCount(count + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtering the People Info
  let personData: any = [];
  (termsOfService || []).map((terms: any) =>
    people.find((data: any) => {
      if (data.id === terms.authorizedPersonId) {
        const person: any = Object.assign({}, data, terms);
        return personData.push(person);
      }
      return undefined;
    })
  );

  const TermsOfModalBody = () => {
    return (
      <>
        <Spin label="loading wait..." loading={isLoadingAllPeople}>
          <PersonCard
            acceptTermsOfServiceLabel={"Authorised to accept terms of service"}
            contentData={personData}
            timezone={timezone}
            emptyData={"Terms of Service Not found"}
          />
        </Spin>
      </>
    );
  };
  return (
    <Modal
      modalView={show}
      modalWidth={930}
      title={title}
      onCancelText={onCancelText}
      onClickCancel={() => {
        onClickCancel();
      }}
      description={TermsOfModalBody()}
    />
  );
};

export { TermsOfServiceModal };

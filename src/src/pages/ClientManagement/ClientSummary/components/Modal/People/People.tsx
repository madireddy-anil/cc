import React, { useState } from "react";
import { Modal, Spin } from "@payconstruct/design-system";

import { useAppSelector } from "../../../../../../redux/hooks/store";
import { useGetStakeHoldersByClientIdQuery } from "../../../../../../services/clientManagement";
import {
  validationOnData,
  generateRandomName
} from "../../../../../../config/transformer";

import { PersonCard } from "../../Card/Person/Person";

const PeopleModalBody: React.FC<any> = () => {
  const [randomName] = useState(generateRandomName);

  // Getting the Store Data
  const {
    clients: { id: entityId }
  } = useAppSelector((state) => state.clientManagement);

  // Get Stakeholder Data By ClientID
  const {
    // refetch,
    people,
    isFetchingAllPeople,
    isLoadingAllPeople
    // isGetAllPeopleSuccess,
    // isGetAllFileError
  } = useGetStakeHoldersByClientIdQuery(
    {
      randomName,
      entityId: entityId
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
      refetchOnMountOrArgChange: 5,
      skip: entityId === undefined
    }
  );

  return (
    <>
      <Spin
        label="loading wait..."
        loading={isFetchingAllPeople || isLoadingAllPeople}
      >
        <PersonCard
          acceptTermsOfServiceLabel={
            "This person is authorised to accept the terms of service"
          }
          showPeopleAddress={true}
          contentData={people}
          emptyData={"Stakeholder was not found"}
        />
      </Spin>
    </>
  );
};

interface PeopleModalProps {
  show: boolean;
  title: any;
  onCancelText: string;
  onClickCancel: () => void;
}

const PeopleModal: React.FC<PeopleModalProps> = ({
  show,
  title,
  onCancelText,
  onClickCancel
}) => {
  return (
    <Modal
      modalView={show}
      modalWidth={930}
      title={title}
      onCancelText={onCancelText}
      onClickCancel={() => {
        onClickCancel();
      }}
      description={<PeopleModalBody />}
    />
  );
};

export { PeopleModal };

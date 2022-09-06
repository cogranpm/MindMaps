import React from "react";
import EdiText from "react-editext";

type TitleProps = {
  content: string;
  saveFn: (title: string) => void;
};

export const Title = (props: TitleProps) => {
  const handleSave = (val: string) => {
    props.saveFn(val);
  };

  return (
    <EdiText
      type="text"
      value={props.content}
      onSave={handleSave}
      tabIndex={0}
      editOnViewClick={true}
      submitOnEnter={true}
      submitOnUnfocus={true}
      cancelOnEscape={true}
      startEditingOnEnter={true}
      showButtonsOnHover={true}
      buttonsAlign="after"
      viewProps={{
        style: {
          fontFamily: "'Roboto', san serif",
          fontSize: "9pt",
        },
      }}
    />
  );
};

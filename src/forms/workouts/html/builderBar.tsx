import React from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { Plus, Trash, Hammer } from 'react-bootstrap-icons';
import { HtmlElement } from "~src/forms/models/workouts/htmlElement";


export type BuilderBarProps = {
  element: HtmlElement | undefined;
  addHandler: (e: HtmlElement | undefined) => void;
  editHandler: (e: HtmlElement | undefined) => void;
  trashHandler: (e: HtmlElement | undefined) => void;
}
export const BuilderBar = (props: BuilderBarProps) => {
  return (
    <ButtonGroup>
      <Button variant="primary" onClick={() => props.addHandler(props.element)}><Plus /></Button>
      <Button variant="primary" disabled={(props.element === undefined)} onClick={() => props.editHandler(props.element)}><Hammer /></Button>
      <Button variant="primary" disabled={(props.element === undefined)} onClick={() => props.trashHandler(props.element)}><Trash /></Button>
    </ButtonGroup>
  )
};

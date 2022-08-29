import React, { useContext, useState, useEffect, Dispatch } from "react";
import { Test, Leaf, TestRunAnswer, Mark, TestRun } from "../../../models/mindMaps/state";
import { Table } from "react-bootstrap";

import { formatDateAndTime } from "../../../../shared/dateAndTime";

export interface TestRunListProps {
  test: Test;
  setActiveTestRun: Dispatch<TestRun>
}

export const TestRunList = (props: TestRunListProps) => {

  const handleSelection = async (testRun: TestRun) => {
    props.setActiveTestRun(testRun);
  };

  const questionsDisplay = props.test.testRuns.map((item, index) => {
    return (
      <tr key={index} onClick={() => handleSelection(item)}>
        <td>{index + 1}</td>
        <td>{item.answers.length}</td>
        <td>{item.answers.filter((answer: TestRunAnswer) => answer.mark === Mark.Correct).length}</td>
        <td>{item.answers.filter((answer: TestRunAnswer) => answer.mark === Mark.Incorrect).length}</td>
        <td>{item.answers.filter((answer: TestRunAnswer) => answer.mark === Mark.Unmarked).length}</td>
        <td>{formatDateAndTime(new Date(item.runDate))}</td>
      </tr>
    );
  });

  return (
    <Table striped bordered hover variant="light">
      <thead>
        <tr>
          <th>#</th>
          <th>Total</th>
          <th>Correct</th>
          <th>Incorrect</th>
          <th>Not Marked</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>{questionsDisplay}</tbody>
    </Table>
  );
};

import React, { useEffect } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { LEAF_TYPES, MindMap, SelectOption, LeafType } from "../models/mindMaps/state";
import * as styles from "../forms.module.css";

export interface MindMapFormProps {
  mindMap: MindMap;
  defaultLeafTypeChangeHandler: (event: any) => void;
}

export const MindMapForm = (props: MindMapFormProps) => {
  return (
    <Form>
      <Form.Group as={Row} className="mb-8" controlId="leafType">
        <Form.Label 
        column 
        sm={2} 
        >
        <span className={styles.treeFormTitle}>Type</span>  
        </Form.Label>
        <Col>
          <Form.Select
            aria-label="Type"
            name="type"
            size="sm"
            value={
              props.mindMap.defaultLeafType
                ? props.mindMap.defaultLeafType
                : LeafType.Note
            }
            onChange={props.defaultLeafTypeChangeHandler}
          >
            {LEAF_TYPES.map((option: SelectOption) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Form.Group>
    </Form>
  );
};

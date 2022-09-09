import React, { useState, useContext, useEffect } from "react";
import { Table, Button, ButtonGroup } from "react-bootstrap";
import { Trash } from "react-bootstrap-icons";
import { MindMap, MindMapViewModel } from "../models/mindMaps/state";
import { AppContext } from "../models/mindMaps/context";
import { ActionType } from "../models/mindMaps/actions";
import { logMessage, logSystemError } from "../../shared/errorHandling";
import { makeMindMap } from "../models/mindMaps/factories";
import { confirmDelete } from "../../shared/windowFunctions";
import { Content, RemoveResult } from "~src/shared/workerMessages";
import {
    BUTTON_VARIANT,
    FETCH_ID_GETMINDMAP,
    FETCH_ID_LOADMINDMAPS,
    FETCH_ID_PUTMINDMAP,
    FETCH_ID_REMOVEMINDMAP,
} from "~src/shared/constants";
import { find, get, persist, remove } from "~src/shared/workerClient";

export function List() {
    const { state, dispatch } = useContext(AppContext);
    const [openNew, setOpenNew] = useState(false);
    const [newId, setNewId] = useState<string | undefined>(undefined);

    //initial load
    useEffect(() => {
        const execute = async () => {
            try {
                loadMindMaps();
            } catch (e) {
                logSystemError(e, "Error in list initialize");
            }
        };
        execute();
    }, []);

    useEffect(() => {
        const execute = async () => {
            if (newId) {
                const existing = state.items.find((item) => item._id === newId);
                if (existing) {
                    handleSelection(existing);
                }
            }
        };
        if (openNew) {
            execute();
        }
    }, [openNew, newId]);

    const loadMindMaps = () => {
        find(
            FETCH_ID_LOADMINDMAPS,
            {
                selector: {
                    name: { $exists: true },
                    leafId: { $exists: false },
                },
                sort: ["name"],
                fields: ["name", "_id", "leafId"],
            },
            loadMindMapsCallback
        );
    };

    const loadMindMapsCallback = (e: Content) => {
        const result = e as PouchDB.Find.FindResponse<Content>;
        const entities = result.docs
            .filter((doc) => !doc.hasOwnProperty("leafId"))
            .map((doc) => {
                const model = doc as unknown as MindMapViewModel;
                return model;
            });
        dispatch({ type: ActionType.InitList, payload: { items: entities } });
    };

    const create = async (event: any) => {
        try {
            const entity = makeMindMap();
            persist(FETCH_ID_PUTMINDMAP, entity, createCallback);
        } catch (e) {
            logSystemError(e, "Error adding mind map");
        }
    };

    const createCallback = (e: Content) => {
        const entity = e as MindMap;
        dispatch({ type: ActionType.Add, payload: { newMindMap: entity } });
        setNewId(entity._id);
        setOpenNew(true);
    };

    const handleSelection = async (item: MindMapViewModel) => {
        get(item._id, FETCH_ID_GETMINDMAP, loadCallback);
    };

    const loadCallback = (e: Content) => {
        dispatch({ type: ActionType.OpenTab, payload: { entity: e as MindMap } });
    };

    const removeMindMap = async (item: MindMapViewModel) => {
        if (!confirmDelete(item.name)) {
            return;
        }
        try {
            remove(item._id, FETCH_ID_REMOVEMINDMAP, removeCallback);
        } catch (err) {
            logSystemError(err, "Error removing mind map");
        }
    };

    const removeCallback = (result: Content) => {
        dispatch({
            type: ActionType.Remove,
            payload: { id: (result as RemoveResult).docId },
        });
    };

    return (
        <Table striped bordered hover size="sm">
            <caption>Brain Dumps</caption>
            <colgroup>
                <col style={{ width: "5%" }} />
                <col style={{ width: "90%" }} />
                <col style={{ width: "5%" }} />
            </colgroup>
            <thead>
                <tr>
                    <th>
                        <ButtonGroup size="sm">
                            <Button variant={BUTTON_VARIANT} onClick={create}>
                                Create
                            </Button>
                        </ButtonGroup>
                    </th>
                    <th></th>
                    <th>
                        <ButtonGroup size="sm">
                            <Button variant={BUTTON_VARIANT} onClick={create}>
                                Create
                            </Button>
                        </ButtonGroup>
                    </th>
                </tr>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>
                        <Trash size={16} aria-label="remove" />
                    </th>
                </tr>
            </thead>
            <tbody>
                {state.items.map((entity: MindMapViewModel, idx: number) => (
                    <tr key={idx}>
                        <td onClick={() => handleSelection(entity)}>{idx}</td>
                        <td onClick={() => handleSelection(entity)}>{entity.name}</td>
                        <td>
                            <Button
                                variant={BUTTON_VARIANT}
                                size="sm"
                                onClick={() => removeMindMap(entity)}
                            >
                                <Trash aria-label="remove" />
                            </Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}

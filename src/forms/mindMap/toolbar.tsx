import React, { useState, useContext } from 'react';
import { Button } from 'react-bootstrap';
import { Archive, ArrowRepeat } from 'react-bootstrap-icons';
import { AppContext } from '../models/mindMaps/context';
import { SyncDialog } from './modals/syncDialog';

export const Toolbar = () => {

    const { state, dispatch } = useContext(AppContext);
    const [showSyncDialog, setShowSyncDialog] = useState(false);

    const onClickDump = () => {
        console.log(JSON.stringify(state));
    };

    const onClickSync = () => {
        setShowSyncDialog(true);
    }


    return (
        <>
            <div>
                <Button title="Dump" onClick={onClickDump} size="sm" variant="outline-info" disabled={false}>
                    <Archive aria-label="Dump" />
                </Button>
                <Button title="Sync" onClick={onClickSync} size="sm" variant="outline-info" disabled={false}>
                    <ArrowRepeat aria-label="Sync" />
                </Button>
            </div>
            {showSyncDialog ? <SyncDialog setShow={setShowSyncDialog} /> : ""}
        </>
    );
}

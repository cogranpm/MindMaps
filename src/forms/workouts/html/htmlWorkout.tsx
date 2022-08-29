import React, { useState, useEffect } from 'react';
import { DivWrapper } from './wrappers/divWrapper';
import { Button } from 'react-bootstrap';
import { Plus } from 'react-bootstrap-icons';
import { HtmlElement } from '../../models/workouts/htmlElement';
import { HtmlBuilder } from './htmlBuilder';
import { uniqueId } from '~src/shared/uuid';

const divComponent =
    (<div><p>I come from here</p></div>);

const pComponent = (<p>p is in style</p>);

//const childComponents = [divComponent, pComponent];

//we can build up a bunch of styles to apply to an element
const styles = `

.divElement { border: 1px solid black; }

.pElement { color: fuchsia; background-color:cyan}

`;

export const HtmlWorkout = () => {


    return (
        <>
            <HtmlBuilder />
            <style dangerouslySetInnerHTML={{
                __html: styles
            }}></style>
        </>
    )
};

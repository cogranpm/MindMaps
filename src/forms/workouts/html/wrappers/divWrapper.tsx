import React from 'react';

type DivProps = React.ComponentProps<'div'>;
/*
type DivProps = {

} & React.ComponentProps<'div'>;
*/

export const DivWrapper = ({ children, ...rest }: DivProps) => {

    return (
        <div {...rest}>
            {children}
        </div>
    )
};

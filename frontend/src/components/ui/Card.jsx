import React from 'react';

const Card = ({
    children,
    variant = 'default',
    hover = false,
    className = '',
    onClick,
    ...props
}) => {
    const variants = {
        default: 'card',
        glass: 'card-glass',
        product: 'card-product',
    };

    const hoverClass = hover ? 'card-hover' : variants[variant];
    const classes = `${hoverClass} ${className}`;

    return (
        <div className={classes} onClick={onClick} {...props}>
            {children}
        </div>
    );
};

export default Card;

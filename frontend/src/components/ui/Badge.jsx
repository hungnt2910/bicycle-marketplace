import React from 'react';

const Badge = ({
    children,
    variant = 'primary',
    className = '',
    ...props
}) => {
    const variants = {
        primary: 'badge-primary',
        secondary: 'badge-secondary',
        success: 'badge-success',
        warning: 'badge-warning',
        danger: 'badge-danger',
        neutral: 'badge-neutral',
        verified: 'status-verified',
        pending: 'status-pending',
        sold: 'status-sold',
    };

    const classes = `badge ${variants[variant] || ''} ${className}`;

    return (
        <span className={classes} {...props}>
            {children}
        </span>
    );
};

export default Badge;

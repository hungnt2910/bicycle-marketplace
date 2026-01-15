import React from 'react';

const Avatar = ({
    src,
    alt = 'Avatar',
    name,
    size = 'md',
    className = '',
    ...props
}) => {
    const sizes = {
        sm: 'avatar-sm',
        md: 'avatar-md',
        lg: 'avatar-lg',
        xl: 'avatar-xl',
    };

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name[0].toUpperCase();
    };

    const classes = `${sizes[size]} ${className}`;

    return (
        <div className={classes} {...props}>
            {src ? (
                <img src={src} alt={alt} className="w-full h-full object-cover" />
            ) : (
                <span>{getInitials(name)}</span>
            )}
        </div>
    );
};

export default Avatar;

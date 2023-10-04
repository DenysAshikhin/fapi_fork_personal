import * as React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';

function MouseOverPopover({ tooltip, children, style, extraClasses, opacity }) {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handlePopoverOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };
    opacity = opacity ? opacity : '0.9';
    const open = Boolean(anchorEl);

    return (
        <div
            class={extraClasses ? extraClasses + 'popoverContainer' : 'popoverContainer'}
            style={style ? style : {}}
        >
            <Typography
                // aria-owns={open ? 'mouse-over-popover' : undefined}
                component={'span'}
                aria-haspopup="true"
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
            >
                {children}
            </Typography>
            <Popover
                id="mouse-over-popover"
                sx={{
                    pointerEvents: 'none'
                }}
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                onClose={handlePopoverClose}
                marginThreshold={32}
                disableRestoreFocus
                // PaperProps={{
                //     style: {
                //       backgroundColor: "transparent",
                //       boxShadow: "none"
                //     },
                //   }}
                slotProps={{
                    paper: {
                        style: {
                            backgroundColor: `rgba(255,255,255,${opacity})`,
                            padding: '6px'
                        }
                    }
                }}
            >
                {tooltip}
            </Popover>
        </div >
    );
}

export default MouseOverPopover;

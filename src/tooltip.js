import * as React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';

function MouseOverPopover({ tooltip, children }) {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handlePopoverOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    return (
        <div

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
                            backgroundColor: "rgba(255,255,255,0.9)",
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

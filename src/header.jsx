// import FARMER_PNG from './assets/images/farmer.png';
import FARMER_PNG from './assets/images/farmer2.png';
import POTATOES_PNG from './assets/images/potatoes.png';
const Header = ({ }) => {

    return (
        <div
            // className='borderSquare header'
            className='header'
            style={{
                height: '36px',
                display: 'flex',
                flex: '1',
                alignItems: 'center',
                padding:'0 0 0 3px',
                margin: '0 0 0 0'
            }}
        >
            <img alt='in game font spelling "Farmer"' src={FARMER_PNG} style={{ height: '31px' }} />

            <div
                className='dobra importantText'
                style={{
                    margin: '0 6px'
                }}
            >
                Against
            </div>

            <img alt='in game font spelling "Potatoes"' src={POTATOES_PNG} style={{ height: '31px' }} />
            <div
                className='dobra importantText'
                style={{
                    marginLeft: '6px'
                }}
            >
                Idle gameplay planner
            </div>
        </div>
    );
};

export default Header;
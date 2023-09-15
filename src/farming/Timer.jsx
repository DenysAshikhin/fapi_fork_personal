import { memo, useState, useEffect } from 'react';
import { useTimer } from 'react-timer-hook';
import { useGlobalAudioPlayer } from 'react-use-audio-player';
import useLocalStorage from "use-local-storage";


const Timer = ({ data, timeCompleted }) => {
    const [loopAlarm, setLoopAlarm] = useLocalStorage("loopAlarm", false);
    const [innerDays, setInnerDays] = useState(0);
    const [innerHours, setInnerHours] = useState(0);
    const [innerMinutes, setInnerMinutes] = useState(0);
    const [innerSeconds, setInnerSeconds] = useState(0);
    const [initialStart, setInitialStart] = useState(true);

    let timeIncrease = ((innerDays * 3600 * 24) + (innerHours * 3600) + (innerMinutes * 60) + (innerSeconds)) * 1000;
    let time = new Date();
    time = new Date(time.getTime() + timeIncrease)
    //


    const { load, play, loop } = useGlobalAudioPlayer();
    useEffect(() => {

        load('/fapi_fork_personal/alarm.mp3', {
            autoplay: false
        });
        setTimeout(() => { loop(loopAlarm) }, 1000)
    }, [])


    const {
        totalSeconds,
        seconds,
        minutes,
        hours,
        days,
        isRunning,
        start,
        pause,
        resume,
        restart,
    } = useTimer({
        expiryTimestamp: time, onExpire: () => {
            if (initialStart) return;
            console.warn('Timer Finished');
            play();
        }
    });

    return (
        <div>
            {/* Timer inputs */}
            <div
                style={{ display: 'flex', justifyContent: 'center' }}
            >
                {/* days */}
                <div
                    style={{ display: 'flex' }}
                >
                    < input
                        type='number'
                        className='prepNumber'
                        value={innerDays}
                        style={{
                            width: '30px'
                        }}
                        onChange={
                            (e) => {
                                try {
                                    let x = Number(e.target.value);
                                    x = Math.floor(x);
                                    if (x < 0 || x > 99) {
                                        return;
                                    }
                                    setInnerDays(x);
                                }
                                catch (err) {
                                    console.log(err);
                                }

                            }}
                        placeholder={innerDays + ''}
                        min="0"
                        max="99"
                    />
                    <div>
                        d:
                    </div>
                </div>
                {/* hours */}
                <div
                    style={{ display: 'flex' }}
                >
                    < input
                        type='number'
                        className='prepNumber'
                        value={innerHours}
                        style={{
                            width: '30px'
                        }}
                        onChange={
                            (e) => {
                                try {
                                    let x = Number(e.target.value);
                                    x = Math.floor(x);
                                    if (x < 0 || x > 99) {
                                        return;
                                    }
                                    setInnerHours(x);
                                }
                                catch (err) {
                                    console.log(err);
                                }

                            }}
                        placeholder={innerHours + ''}
                        min="0"
                        max="99"
                    />
                    <div>
                        h:
                    </div>
                </div>
                {/* minutes */}
                <div
                    style={{ display: 'flex' }}
                >
                    < input
                        type='number'
                        className='prepNumber'
                        value={innerMinutes}
                        style={{
                            width: '30px'
                        }}
                        onChange={
                            (e) => {
                                try {
                                    let x = Number(e.target.value);
                                    x = Math.floor(x);
                                    if (x < 0 || x > 99) {
                                        return;
                                    }
                                    setInnerMinutes(x);
                                }
                                catch (err) {
                                    console.log(err);
                                }

                            }}
                        placeholder={innerMinutes + ''}
                        min="0"
                        max="99"
                    />
                    <div>
                        m:
                    </div>
                </div>
                {/* seconds */}
                <div
                    style={{ display: 'flex' }}
                >
                    < input
                        type='number'
                        className='prepNumber'
                        value={innerSeconds}
                        style={{
                            width: '30px'
                        }}
                        onChange={
                            (e) => {
                                try {
                                    let x = Number(e.target.value);
                                    x = Math.floor(x);
                                    if (x < 0 || x > 99) {
                                        return;
                                    }
                                    setInnerSeconds(x);
                                }
                                catch (err) {
                                    console.log(err);
                                }

                            }}
                        placeholder={innerSeconds + ''}
                        min="0"
                        max="99"
                    />
                    <div>
                        s
                    </div>
                </div>
            </div>

            <div
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '6px' }}
            >
                <div
                    style={{ display: 'flex', justifyContent: 'center', marginRight: '6px' }}
                >
                    <div>
                        Loop Alarm
                    </div>
                    <input
                        type='checkbox'
                        checked={loopAlarm}
                        onChange={(e) => {
                            setLoopAlarm(e.target.checked);
                            loop(e.target.checked);
                        }}
                    />
                </div>
                <button
                    onClick={(e) => {
                        if (initialStart) {
                            setInitialStart(false);
                            restart(time);
                        }
                        if (isRunning) {
                            restart(time);
                        }
                        else {
                            start(e);
                        }
                    }
                    }>Start</button>
                <button
                    style={{ margin: '0 6px' }}
                    onClick={pause}>Pause</button>
                {/* <button onClick={resume}>Resume</button> */}
                <button onClick={() => {
                    // Restarts to 5 minutes timer
                    // const time = new Date();
                    // time.setSeconds(time.getSeconds() + 300);
                    restart(time)
                }}>Restart</button>
            </div>

            <div style={{ fontSize: '20px', display: 'flex', margin: '6px 0 0 0', justifyContent: 'center' }}>
                <div>
                    <span>{days + 'd'}</span>
                </div>
                :
                <div>
                    <span>{hours + 'h'}</span>
                </div>
                :
                <div>
                    <span>{minutes + 'm'}</span>
                </div>
                :
                <div>
                    <span>{seconds + 's'}</span>
                </div>
            </div>

        </div>
    )
}

export default memo(Timer, function (old, curr) {
    return true;//nothing changed
})



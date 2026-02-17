import { useState } from "react";
import { PauseButton } from "./Buttons";
import { GameOverScreen } from "./GameOverScreen";
import { PauseMenuScreen } from "./PauseMenuScreen";

export function GameScreen() {
    const [isPaused, setIsPaused] = useState(false)
    return (
        <>
            {!isPaused
                ? <PauseButton setIsPaused={setIsPaused} />
                : <PauseMenuScreen setIsPaused={setIsPaused} />
            }


            {/* PAUSE MENU SCREEN */}


            {/* GAME OVER SCREEN */}
            <GameOverScreen />
        </>
    )
}
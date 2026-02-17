import { useState } from "react";
import { PauseButton } from "./Buttons";
import { GameOverScreen } from "./GameOverScreen";

export function GameScreen() {
    const [isPaused, setIspaused] = useState(false)
    return (
        <>
                <PauseButton />
            

            {/* PAUSE MENU SCREEN */}
            

            {/* GAME OVER SCREEN */}
            <GameOverScreen />
        </>
    )
}
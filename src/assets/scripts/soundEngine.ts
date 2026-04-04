export function buttonClickSound () {
    const clickSound: HTMLAudioElement = new Audio("/buttonClickSound.wav")
    clickSound.volume = 0.5
    clickSound.play().catch(e => console.log("error play click sound: ", e))
}
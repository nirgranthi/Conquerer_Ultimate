import { seed } from "../../components/configs"

let x0 = seed
const a = 999999937
const c = 310248241
const m = (2 ** 31) - 1
export function seeder () {
    const x1 = (a * x0 + c) % m
    x0 = x1
    if (x1.toString().length > 8) return x1/m
    else return seeder()
}


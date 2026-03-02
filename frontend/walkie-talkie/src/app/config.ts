export const SERVER = process.env.NEXT_PUBLIC_SERVER
export const PORT_SERVER = process.env.NEXT_PUBLIC_PORT_SERVER
export const PORT_CLIENT = process.env.NEXT_PUBLIC_PORT_CLIENT
export const API_URL = process.env.NEXT_PUBLIC_API_URL || `http://${SERVER}:${PORT_SERVER}`
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || `ws://${SERVER}:8080`

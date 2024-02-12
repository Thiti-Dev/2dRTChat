declare global {
    namespace NodeJS {
        interface ProcessEnv extends ValidEnvironmentVars {}
    }
}
interface ValidEnvironmentVars{
    WEBSOCKET_HOST: string;
}
export {}

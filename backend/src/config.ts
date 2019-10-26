interface IConfig {
    port: number;
    debugLogging: boolean;
    mongoUrl: string;
}

class Config implements IConfig {
    public port: number = +process.env.PORT || 8080;
    public debugLogging: boolean = process.env.NODE_ENV === "development";
    public mongoUrl: string = process.env.MONGO_URL || "mongodb://localhost:27017/airlineseat";
}

const config = new Config();

export { config };

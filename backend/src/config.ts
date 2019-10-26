interface IConfig {
    port: number;
    debugLogging: boolean;
    mongoUrl: string;
    redisHost: string;
    redisPort: number;
}

class Config implements IConfig {
    public port: number = +process.env.PORT || 8080;
    public debugLogging: boolean = process.env.NODE_ENV === "development";
    public mongoUrl: string = process.env.MONGO_URL || "mongodb://localhost:27017/airlineseat";
    public redisHost: string = process.env.REDIS_HOST || "localhost";
    public redisPort: number = +process.env.REDIS_PORT || 6379;
}

const config = new Config();

export { config };

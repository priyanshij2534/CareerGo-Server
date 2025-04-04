import app from './app'
import config from './config/config'
import { DURATION, initRateLimiter, POINTS } from './config/rateLimiter'
import databaseService from './service/databaseService'
import logger from './utils/logger'

const server = app.listen(config.PORT)

// eslint-disable-next-line @typescript-eslint/no-floating-promises
;(async () => {
    try {
        const connection = await databaseService.connect()
        logger.info(`DATABASE_CONNECTION`, {
            meta: {
                connectionName: connection.name
            }
        })

        initRateLimiter(connection)
        logger.info(`RATE_LIMITER_INITIALIZED`, {
            meta: {
                duration: DURATION,
                points: POINTS
            }
        })

        logger.info(`APPLICATION_STARTED`, {
            meta: {
                PORT: config.PORT,
                SERVER_URL: config.SERVER_URL
            }
        })
    } catch (error) {
        logger.error(`APPLICATION_ERROR`, { meta: error })
        server.close(() => {
            if (error) {
                logger.error(`APPLICATION_ERROR`, { meta: error })
            }
            process.exit(1)
        })
    }
})()

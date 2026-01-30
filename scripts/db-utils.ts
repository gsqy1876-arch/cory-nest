/**
 * 数据库脚本工具
 *
 * 提供数据库管理的常用功能
 */

import { config } from 'dotenv'
import { DataSource } from 'typeorm'
import { resolve } from 'path'

// 加载环境变量
config({ path: resolve(__dirname, '../.env') })

/**
 * 数据库配置接口
 */
interface DbConfig {
  host: string
  port: number
  username: string
  password: string
  database: string
}

/**
 * 获取并验证数据库配置
 */
function getDbConfig(): DbConfig {
  const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE } = process.env

  // 校验必需的环境变量
  if (!DB_PASSWORD) {
    throw new Error('❌ 缺少环境变量 DB_PASSWORD，请检查 .env 文件')
  }

  return {
    host: DB_HOST || 'localhost',
    port: parseInt(DB_PORT || '5432', 10),
    username: DB_USERNAME || 'postgres',
    password: DB_PASSWORD,
    database: DB_DATABASE || 'nest_db',
  }
}

/**
 * 创建数据库连接
 */
export async function createConnection(): Promise<DataSource> {
  const dbConfig = getDbConfig()

  const dataSource = new DataSource({
    type: 'postgres',
    ...dbConfig,
    entities: [resolve(__dirname, '../src/**/*.entity.ts')],
    synchronize: false,
  })

  await dataSource.initialize()
  return dataSource
}

/**
 * 关闭数据库连接
 */
export async function closeConnection(dataSource: DataSource): Promise<void> {
  if (dataSource?.isInitialized) {
    await dataSource.destroy()
  }
}

/**
 * 执行数据库脚本的通用包装器
 */
export async function runScript(
  scriptName: string,
  callback: (dataSource: DataSource) => Promise<void>,
): Promise<void> {
  let dataSource: DataSource | null = null

  try {
    console.log(`🚀 Starting script: ${scriptName}`)
    dataSource = await createConnection()
    console.log('✅ Database connected')

    await callback(dataSource)

    console.log(`✅ Script completed: ${scriptName}`)
  } catch (error) {
    console.error(`❌ Script failed: ${scriptName}`)
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  } finally {
    if (dataSource) {
      await closeConnection(dataSource)
      console.log('✅ Database connection closed')
    }
  }
}
